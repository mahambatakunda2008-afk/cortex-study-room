# Cortex Study Room

> A concurrent multi-agent study room where specialized AI agents collaborate around a learner instead of taking turns in a rigid pipeline.

## MVP

Cortex demonstrates four independent reactive roles:

- **Researcher**: maps concepts and prerequisites.
- **Tutor**: teaches and repairs explanations.
- **Challenger**: hunts gaps and broadcasts findings.
- **Examiner**: creates diagnostics and evaluates answers.

The room exposes a shared state and event stream. Agents start concurrently and react to events produced by the others. The UI makes the orchestration visible instead of hiding it behind a single chatbot.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Demo flow

1. Keep the prefilled Cambridge AS Physics goal, or enter your own.
2. Click **Start Study Room**.
3. Watch all four agents activate together.
4. Watch **Challenger** emit `CONCEPT_GAP_DETECTED`.
5. Watch **Tutor** react and repair the lesson.
6. Answer the Examiner diagnostic with `20000000` to demonstrate evaluation.
7. Reset and run again with another goal.

## Why the MVP is local-first

The orchestration layer is deterministic by design so the core demo survives network and model-provider failure. A model adapter can be added later without changing the room/event architecture.

## Architecture

See `docs/ARCHITECTURE.md` for the shared-state and event model.

## Status

🚧 Hackathon build in progress.
