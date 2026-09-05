# Architecture

## Core idea

The Study Room is an event-driven shared-state environment. Agents are independent participants that subscribe to room events, inspect current state, and publish observations or actions.

```text
                    ┌─────────────────────┐
                    │     Study Room      │
                    │ goal + learner state│
                    │ events + artifacts  │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
       ▼                       ▼                       ▼
  Researcher                 Tutor                Challenger
       │                       │                       │
       └──────────────┬────────┴──────────┬────────────┘
                      │                   │
                      ▼                   ▼
                  Examiner          shared events
                      │                   │
                      └─────────┬─────────┘
                                ▼
                         Room synthesis
```

## Shared state

The room should maintain a small, inspectable state object rather than hidden agent-to-agent context:

- learner goal
- subject/topic
- learner profile
- discovered concepts
- explanations
- misconceptions
- questions
- answers
- agent observations
- event history
- final study plan

## Event model

Examples:

- `ROOM_STARTED`
- `RESEARCH_UPDATED`
- `LESSON_PROPOSED`
- `CONCEPT_GAP_DETECTED`
- `MISCONCEPTION_DETECTED`
- `QUESTION_CREATED`
- `ANSWER_SUBMITTED`
- `ASSESSMENT_UPDATED`
- `ROOM_SYNTHESIS_REQUESTED`
- `ROOM_COMPLETED`

An agent may emit an event that causes another interested agent to react. The implementation must preserve enough event/state visibility for the demo to prove that collaboration is concurrent and reactive, not merely a serial list of API calls.

## Demo principle

The UI should make the invisible orchestration visible. Judges should be able to see multiple agents working at once, shared state changing, and at least one agent reacting to another agent's finding.
