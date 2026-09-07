# Adaptive learner state

Cortex keeps learner evidence on the device so a study session can become more useful over time without requiring a cloud account.

## Loop

`response -> evidence -> mastery -> weakness -> prerequisite diagnosis -> targeted follow-up`

Each answered question updates a concept-level record containing attempts, correct responses, mastery, a mastery band, review status, and the last-seen timestamp.

The model is stored in browser local storage using a goal-scoped key. Storage failures are intentionally ignored so offline study remains usable.

## Runtime behaviour

- A new `StudyRoom` loads previously saved evidence for the same study objective.
- Starting another pass keeps that learner model instead of replacing it with an empty model.
- A wrong response marks the concept for review and can identify a prerequisite target from the knowledge graph.
- A correct response updates mastery and selects the weakest known area for the next study step.
- Follow-up practice is selected from learner evidence rather than from a fixed question order.

The persisted learner model is local browser state. It is not a replacement for a future authenticated cross-device learner profile or encrypted sync layer.
