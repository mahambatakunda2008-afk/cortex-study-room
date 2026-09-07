# Cortex learning-system roadmap

## Current

- Four concurrent study agents
- Shared event-driven room state
- Subject-aware curriculum profiles
- Prerequisite knowledge graph
- Learner evidence and mastery bands
- Goal-scoped local learner persistence
- Evidence-driven follow-up selection

## Next implementation layer

1. Add a study-source input for pasted syllabus, notes, textbook extracts, and past-paper text.
2. Parse source material into grounded concepts, sections, evidence, and candidate relationships.
3. Build a source-backed knowledge graph instead of relying only on built-in profiles.
4. Generate assessments from the source material and tag every question to a concept.
5. Persist source metadata and learner evidence locally for offline continuation.
6. Add explicit agent reactions after every learner response so the UI shows the adaptation chain, not just the final result.
7. Add optional model-backed generation behind the same local deterministic interface.

The product principle is: the learner's evidence changes what Cortex does next. AI generation should enrich that loop, not replace it.
