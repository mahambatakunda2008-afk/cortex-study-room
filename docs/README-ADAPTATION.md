# Adaptation architecture

Cortex treats an answer as evidence, not merely a quiz result.

When the learner responds, the room:

1. evaluates the response;
2. updates concept-level evidence;
3. recalculates mastery and review status;
4. checks the knowledge graph for a prerequisite weakness;
5. updates the next-study plan;
6. emits a gap event when the evidence warrants intervention;
7. lets Tutor, Challenger, and Examiner react to the new state;
8. selects the next practice item from the resulting learner model.

Learner evidence is persisted locally by study objective. This makes the model available after a page reload while keeping the current implementation device-first.
