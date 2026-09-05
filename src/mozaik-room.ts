import {
  Agent,
  RuntimeState,
  SituationSpecification,
  createAgent,
  createHuman,
  defineRuntime,
  runLoop,
  sendMessage,
  type SituationContext,
  type SituationHandler,
} from '@mozaik-ai/core';

export type CortexRole = 'researcher' | 'tutor' | 'challenger' | 'examiner';

/**
 * Mozaik-native runtime seam for Cortex.
 *
 * Four agents join one shared runtime. The initial learner goal fans out into
 * four independent runLoop calls. Later model.answer events trigger selective
 * peer reactions without a central sequential orchestrator.
 */
export class CortexRuntimeState extends RuntimeState {
  goal = '';
  lastActivity: Record<string, string> = {};
}

const runtime = defineRuntime<CortexRuntimeState>();
let initialized = false;

class WhenLearnerGoal extends SituationSpecification {
  constructor(private readonly humanId: string) {
    super();
  }

  isSatisfiedBy({ event, participant }: SituationContext): boolean {
    return event.type === 'message.sent'
      && event.producerId === this.humanId
      && event.producerId !== participant.getId();
  }
}

class WhenPeerAnswers extends SituationSpecification {
  constructor(
    private readonly role: CortexRole,
    private readonly ids: Partial<Record<CortexRole, string>>,
  ) {
    super();
  }

  isSatisfiedBy({ event, participant }: SituationContext): boolean {
    if (event.type !== 'model.answer' || event.producerId === participant.getId()) return false;
    return (Object.keys(this.ids) as CortexRole[]).some(
      (candidate) => candidate !== this.role && this.ids[candidate] === event.producerId,
    );
  }
}

const roleInstructions: Record<CortexRole, string> = {
  researcher: 'Map concepts, prerequisites, formulas, and likely misconceptions. Return structured findings for the other agents.',
  tutor: 'Teach clearly and adapt the explanation when peer findings reveal gaps or contradictions.',
  challenger: 'Act as an adversarial checker. Hunt conceptual gaps and weak explanations, then propose concrete corrections.',
  examiner: 'Design diagnostic questions and judge whether the learner can actually apply the concepts.',
};

export function createCortexMozaikRoom(goal: string) {
  if (!initialized) {
    runtime.initializeRuntime({ state: new CortexRuntimeState() });
    initialized = true;
  }

  runtime.resolveRuntime().state.goal = goal;

  const human = createHuman({ name: 'Learner', capabilities: [], handlers: [] });
  const ids: Partial<Record<CortexRole, string>> = {};
  const agents = {} as Record<CortexRole, Agent>;

  const makeHandlers = (role: CortexRole): SituationHandler[] => [
    {
      specification: new WhenLearnerGoal(human.getId()),
      processor: {
        apply({ event, participant }) {
          if (!(participant instanceof Agent)) return;
          const message = (event.payload as { message?: string }).message ?? goal;
          runtime.resolveRuntime().state.lastActivity[participant.getId()] = 'Started independent analysis';
          runLoop(participant.getId(), message, {
            model: 'gpt-5.4',
            context: participant.getMemory().getContext(),
            tools: participant.getTools(),
            streaming: true,
          });
        },
      },
    },
    {
      specification: new WhenPeerAnswers(role, ids),
      processor: {
        apply({ participant }) {
          if (!(participant instanceof Agent)) return;
          runtime.resolveRuntime().state.lastActivity[participant.getId()] = 'Reacting to peer output';
          runLoop(
            participant.getId(),
            `A peer agent just produced a result. You are the ${role}. Reassess your work in light of the peer contribution and make the next concrete contribution to the shared learner goal: ${goal}`,
            {
              model: 'gpt-5.4',
              context: participant.getMemory().getContext(),
              tools: participant.getTools(),
              streaming: true,
            },
          );
        },
      },
    },
  ];

  (Object.keys(roleInstructions) as CortexRole[]).forEach((role) => {
    const agent = createAgent({
      name: `Cortex ${role}`,
      capabilities: ['inference'],
      instruction: roleInstructions[role],
      tools: [],
      handlers: makeHandlers(role),
    });
    agents[role] = agent;
    ids[role] = agent.getId();
  });

  runtime.join(human);
  Object.values(agents).forEach((agent) => runtime.join(agent));
  sendMessage(goal, human.getId());

  return { runtime, human, agents };
}
