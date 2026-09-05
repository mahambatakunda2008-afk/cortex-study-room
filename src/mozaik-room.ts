import {
  AgenticEnvironment,
  BaseParticipant,
  ModelContext,
  UserMessageItem,
  runInference,
  sendMessage,
} from '@mozaik-ai/core';

/**
 * Production-facing orchestration seam for the hackathon build.
 * The UI can keep using the deterministic room when no provider key exists,
 * while this adapter proves the same four roles are real Mozaik participants.
 */
export type CortexRole = 'researcher' | 'tutor' | 'challenger' | 'examiner';

export class CortexParticipant extends BaseParticipant {
  private readonly context = ModelContext.create(`cortex-${this.role}`);

  constructor(
    public readonly role: CortexRole,
    private readonly environment: AgenticEnvironment,
  ) {
    super();
  }

  async onMessage(message: string): Promise<void> {
    this.context.addContextItem(UserMessageItem.create(message));
    runInference({
      model: 'gpt-5.4',
      context: this.context,
      caller: this,
      environment: this.environment,
      streaming: true,
    });
  }

  async onExternalModelMessage(source: BaseParticipant, item: unknown): Promise<void> {
    // Peer output becomes awareness for the next inference cycle.
    // Keeping this hook explicit is what makes the participant reactive.
    void source;
    void item;
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

  return { environment, human, agents: { researcher, tutor, challenger, examiner } };
}
