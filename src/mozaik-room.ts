import {
  AgenticEnvironment,
  BaseParticipant,
  ModelContext,
  ModelMessageItem,
  Participant,
  UserMessageItem,
  runInference,
  sendMessage,
} from '@mozaik-ai/core';

/**
 * Production-facing Mozaik orchestration seam.
 * Four specialized participants start from the same learner goal, run
 * concurrently, and selectively react to peer model output through the
 * environment event bus. No central sequential agent pipeline is required.
 */
export type CortexRole = 'researcher' | 'tutor' | 'challenger' | 'examiner';

const reactivePeers: Record<CortexRole, CortexRole[]> = {
  researcher: [],
  tutor: ['researcher', 'challenger'],
  challenger: ['researcher', 'tutor'],
  examiner: ['researcher', 'tutor', 'challenger'],
};

export class CortexParticipant extends BaseParticipant {
  private readonly context = ModelContext.create(`cortex-${this.role}`);
  private reacting = false;

  constructor(
    public readonly role: CortexRole,
    private readonly environment: AgenticEnvironment,
  ) {
    super();
  }

  async onMessage(message: string): Promise<void> {
    this.context.addContextItem(UserMessageItem.create(this.rolePrompt(message)));
    this.startInference();
  }

  async onExternalModelMessage(source: Participant, item: ModelMessageItem): Promise<void> {
    if (!(source instanceof CortexParticipant)) return;
    if (!reactivePeers[this.role].includes(source.role)) return;
    if (this.reacting) return;

    this.reacting = true;
    try {
      this.context.addContextItem(item);
      this.context.addContextItem(
        UserMessageItem.create(
          `Peer update from ${source.role}. React to it now. Preserve useful work, correct contradictions, and produce the next concrete contribution for the shared study room.`,
        ),
      );
      this.startInference();
    } finally {
      this.reacting = false;
    }
  }

  private startInference(): void {
    void runInference({
      model: 'gpt-5.4',
      context: this.context,
      caller: this,
      environment: this.environment,
      streaming: true,
    });
  }

  private rolePrompt(goal: string): string {
    const roleInstructions: Record<CortexRole, string> = {
      researcher: 'Research and structure the topic: concepts, prerequisites, formulas, and likely misconceptions.',
      tutor: 'Teach the learner clearly. Build and continuously repair an explanation based on peer discoveries.',
      challenger: 'Act as the adversarial checker. Look for conceptual gaps, contradictions, and weak explanations, then surface them immediately.',
      examiner: 'Design diagnostic questions and assess whether the learner can actually apply the concepts.',
    };
    return `Learner goal: ${goal}\nYour role: ${roleInstructions[this.role]}\nWork independently first, then react to relevant peer output through the shared environment.`;
  }
}

export function createCortexMozaikRoom(goal: string) {
  const environment = new AgenticEnvironment();
  const researcher = new CortexParticipant('researcher', environment);
  const tutor = new CortexParticipant('tutor', environment);
  const challenger = new CortexParticipant('challenger', environment);
  const examiner = new CortexParticipant('examiner', environment);

  [researcher, tutor, challenger, examiner].forEach((agent) => agent.join(environment));

  const human = new BaseParticipant();
  human.join(environment);
  sendMessage(environment, goal, human);

  return {
    environment,
    human,
    agents: { researcher, tutor, challenger, examiner },
  };
}
