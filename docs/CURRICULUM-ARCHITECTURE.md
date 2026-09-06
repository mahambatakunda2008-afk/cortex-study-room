# Subject-aware curriculum architecture

Cortex Study Room is not tied to a single school subject.

The study objective is parsed into a subject and topic. Supported deterministic profiles currently cover Physics, Chemistry, Mathematics, Computer Science and Biology. Unknown subjects use a generic curriculum structure rather than inventing syllabus-specific facts.

Each profile supplies:
- core concepts
- a prerequisite knowledge graph
- an initial teaching path
- diagnostic questions

The runtime keeps the same four-agent architecture across subjects. Research maps the curriculum, Instruction builds the learner path, Review checks conceptual risk, and Assessment produces learner evidence.

The next extension point is syllabus/content ingestion. A supplied syllabus, notes or textbook can replace the generic profile with grounded concept nodes, prerequisite edges and assessment material without changing the agent runtime or UI.
