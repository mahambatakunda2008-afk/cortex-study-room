# JigJoy Demo Script

## 90-second story

**Opening:**
> Most AI tutors are one model pretending to be a team. Cortex is a room where specialized agents actually work concurrently and react to each other.

**Start:**
Enter: `I have a Physics test tomorrow on deformation of solids. Teach me what I need, then test me.`

**Point at the four cards:**
> Researcher maps the knowledge. Tutor builds the lesson. Challenger looks for what the room is getting wrong. Examiner tests whether I actually understand it.

Click **Start Study Room**.

**Concurrency moment:**
> Notice they all started together. There is no Researcher → Tutor → Challenger → Examiner pipeline.

Wait for the event stream to show:

`CONCEPT_GAP_DETECTED`

Then say:
> Challenger just found a likely confusion: elastic limit is not breaking point. That event changes the shared room state, and Tutor reacts to it.

**Exam moment:**
The Examiner generates the stress calculation. Submit `20000000`.

> The Examiner isn't just generating a question. It is observing the same room state and producing a diagnostic response.

**Close:**
> The interesting part isn't four prompts. It's the environment. Agents can observe, emit events, and react while other agents are still working. That's the architecture we can scale from a study room into an autonomous learning system.

## Judge-facing technical points

- TypeScript implementation.
- Four specialized participants.
- Shared state and visible event stream.
- Concurrent initial work with reactive follow-up.
- Challenger-to-Tutor feedback loop.
- Mozaik-native adapter in `src/mozaik-room.ts` using `AgenticEnvironment` and `BaseParticipant`.
- Deterministic fallback keeps the demo functional without an external model key.
- Model-backed execution can be enabled through environment credentials.
