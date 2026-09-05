# Cortex Study Room

## One-line pitch

Cortex Study Room is a multi-agent learning room where four specialized agents work concurrently around one learner, share runtime state, and react to each other's discoveries instead of pretending to be a sequential team.

## The problem

A typical AI tutor is one model wearing several hats. It can explain, question, critique, and assess, but those behaviors usually happen inside one rigid turn-taking pipeline.

Cortex makes the collaboration visible and structural: Researcher, Tutor, Challenger, and Examiner are independent participants with different responsibilities.

## What happens in the demo

1. The learner enters a goal such as: "I have a Physics test tomorrow on deformation of solids. Teach me what I need, then test me."
2. Four agents begin concurrently.
3. Researcher maps the topic and likely misconceptions.
4. Tutor builds the explanation.
5. Challenger hunts for a conceptual gap and can trigger a Tutor reaction.
6. Examiner creates a diagnostic question.
7. The learner answers and receives an assessment plus a next-study move.

The UI exposes the agent states and event stream so judges can see concurrency and reaction rather than taking it on faith.

## Why Mozaik

The production-facing adapter uses `@mozaik-ai/core` with a shared runtime, four agents, `runLoop` calls, and situation handlers. The initial learner message fans out to independent agent loops. Peer `model.answer` events can selectively trigger another agent's loop, creating reactive collaboration without a central sequential orchestrator.

The repository also contains a deterministic local study-room engine. This is intentional: the visible demo remains reliable when API credentials or network access are unavailable, while the Mozaik adapter demonstrates the real runtime integration.

## Architecture

```text
Learner
   |
   v
Shared Mozaik Runtime
   |
   +--> Researcher ----+
   |                   |
   +--> Tutor <---------+  peer reactions
   |                   |
   +--> Challenger ----+
   |                   |
   +--> Examiner <-----+
   |
   +--> semantic/model events
```

There is no `Coordinator -> Agent 1 -> Agent 2 -> Agent 3` pipeline in the Mozaik layer. Each participant joins the same runtime and reacts to events that match its own situation specifications.

## Reliability choice

The browser experience uses a deterministic local engine so the submission can be demonstrated without exposing provider API keys or depending on a live provider. Model-backed Mozaik execution is kept as a separate runtime adapter suitable for a server-side execution boundary.

## Run

```bash
npm install
npm run dev
```

## Judge checklist

- [x] Four specialized agents
- [x] Concurrent initial work
- [x] Shared runtime/state concept
- [x] Reactive peer-to-peer behavior
- [x] Visible event stream
- [x] Learner interaction
- [x] Diagnostic assessment
- [x] Deterministic offline-capable demo path
- [x] Mozaik runtime adapter
