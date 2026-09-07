export type MasteryBand = 'unknown' | 'developing' | 'secure';

export type ConceptEvidence = {
  topic: string;
  attempts: number;
  correct: number;
  mastery: number;
  band: MasteryBand;
  needsReview: boolean;
  lastSeen: number;
};

export type LearnerModel = Record<string, ConceptEvidence>;

const storagePrefix = 'cortex:learner:';

function storageKey(goal: string): string {
  const normalized = goal.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 180);
  return storagePrefix + normalized;
}

export function loadLearnerModel(goal: string): LearnerModel {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey(goal));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LearnerModel;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLearnerModel(goal: string, model: LearnerModel): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(goal), JSON.stringify(model));
  } catch {
    // Local persistence is an enhancement, never a reason to break a study session.
  }
}

export function clearLearnerModel(goal: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey(goal));
  } catch {
    // Ignore storage failures and keep the in-memory session usable.
  }
}

export function updateLearnerModel(model: LearnerModel, topic: string, correct: boolean): LearnerModel {
  const key = topic.trim().toLowerCase();
  const previous = model[key];
  const attempts = (previous?.attempts ?? 0) + 1;
  const correctCount = (previous?.correct ?? 0) + (correct ? 1 : 0);
  const mastery = Math.round((correctCount / attempts) * 100);
  const band: MasteryBand = mastery >= 80 ? 'secure' : mastery > 0 ? 'developing' : 'unknown';
  return {
    ...model,
    [key]: {
      topic,
      attempts,
      correct: correctCount,
      mastery,
      band,
      needsReview: !correct || mastery < 70,
      lastSeen: Date.now(),
    },
  };
}

export function weakestTopic(model: LearnerModel): string | null {
  const entries = Object.values(model);
  if (!entries.length) return null;
  return entries.slice().sort((a, b) => {
    if (a.needsReview !== b.needsReview) return a.needsReview ? -1 : 1;
    return a.mastery - b.mastery;
  })[0]?.topic ?? null;
}
