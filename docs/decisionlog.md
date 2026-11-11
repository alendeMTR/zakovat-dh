# Decision log

> Every decision, with its date, who made it, and why. Includes every place the original brief
> (`PROMPT.md`) was changed or rejected. Read the entries on a subject before you propose a change
> to it. Do not re-open a decided entry without new evidence; if you have some, say so and ask.
>
> **Who:** *owner* = decided by the owner · *agent* = decided by the agent under the brief's
> "decide, log, keep going" rule (the owner may overrule any of these).
> **Spec change:** marks an entry that changes or rejects something in `PROMPT.md`.

---

## 2026-11-11 — Phase 2 (owner replied "agreed on everything else")

### Process and tooling

**D1. Claude builds alone; Codex only reviews.** *owner*
Codex runs `codex review` (CLI 0.142.0, installed locally) at the end of each milestone, read-only.
Its findings go into `docs/fixlist.md`; the agent sorts them and fixes the valid ones.
Why: a small app; design and visual review stay with the main model under the brief's own rules;
two writers on one repo cost handoffs and conflicts. A second model catches different bugs, at no extra cost
(Codex is included in ChatGPT Pro, per OpenAI's pricing page, read 2026-11-11).

**D2. Hosting: a new private GitHub repo, a new Vercel project, a new Firebase project (Spark plan).** *owner*
All separate from Axeno. Why: game data and Axeno users stay apart; nothing in Axeno can break this app or the reverse.

**D3. The project folder gets its own git repo (`main`).** *agent*
Why: before this, git resolved to the home folder `C:\Users\Spectre`.

### Screens and accounts

**D4. One projector screen.** *owner*
The students see everything the teacher sees; the answer stays hidden until the teacher reveals it.
The state is kept so that a second "audience window" (two windows, one computer) can be added later without rework.
Why: works in every room with no setup. Rejected for now: two windows on one computer (teachers must switch Windows
to Extend each lesson); the phone as a remote (needs live network sync and sign-in on the phone).

**D5. One account per teacher, Google sign-in (Firebase Auth).** *owner*
Kept: question sets and finished games with their breakdowns. Nothing about students beyond team names.
The game itself runs without sign-in. Sign-in is needed only for saved sets, game history and AI generation.
Why: question sets are slow to make, are reused across classes and years, and AI ones cost money, so they must
follow the teacher between devices. A shared school password leaks and lets anyone delete anyone's sets.
Per-teacher sign-in also protects the AI endpoint.

### Game rules

**D6. Teams answer on paper slips.** *owner* — **Spec change** (the brief left the answer signal open)
Each team writes its answer and hands the slip to the teacher. The teacher taps the team's row the moment the
slip arrives; the platform records the time since the timer started. One tap per team; a second tap undoes it.
Why: all teams answer the same question with no turn order, so a spoken answer gives it to the other teams.

**D7. The extra bonus is pre-selected from the hand-in time; the teacher confirms.** *owner* — **Spec change**
(the brief: "the platform does not judge this").
When the recorded time falls inside the extra window, "correct + extra" is pre-selected for that team; the teacher
confirms or changes it. Three verdict buttons stay. Why: with up to 8 teams the teacher cannot remember who handed
in when. The teacher still decides.

**D8. Verdict buttons unlock after the answer is revealed.** *agent* — **Spec change**
Why: everything is on the projector (D4). A "correct" mark while other teams are still thinking tells them another team has it.

**D9. Points (editable defaults in setup, collapsed).** *owner*
| Type | Correct | Extra |
|---|---|---|
| Oddiy savol | 2 | +1 |
| Zakovat sandiqchasi | 3 | +1 |
| Direktor savoli | 4 | +1 |
Wrong or no answer: 0. No penalties. Why: harder questions are worth more; no penalty keeps weaker teams answering.

**D10. Direktor savoli: the director (or a guest) asks it in person, or the teacher reads it on their behalf.** *owner*
Worth double the points of an Oddiy savol (D9). The card shows the question text as usual, labelled "Direktor savoli".
Why: needs no new UI. Rejected: a stake round (adds a betting step per team, hurts weaker teams).
No Zakovat source defines a "Direktor savoli"; this rule is the school's own.

**D11. Zakovat sandiqchasi: the answer is the object in the box.** *owner*
The teacher types the object and AI writes the question (a short story, a riddle or an unexpected fact), or the
teacher writes or pastes the question. No separate "object" field: the answer field holds it.
Before the game, setup lists the objects to put in boxes. Why: one field less; the list tells the teacher what to prepare.
The `references/04` example (retell a thought from "Garov") does not fit this definition and is not used (brief).

**D12. Type mix.** *agent*
The type belongs to each question, so the question set defines the mix. AI default: 1 Direktor savoli and
1 Zakovat sandiqchasi per game, the rest Oddiy savol; the teacher changes the counts.
Why: the reference wheel (`references/02`) shows one of each among 30 pockets.

**D13. Answer reveal.** *agent*
Hidden until the teacher clicks "Show answer"; the button is available at any time.

**D14. Timer.** *agent*
Starts on the teacher's click, after the question is read aloud. Pause, resume, reset. At zero: one short tone
(mute switch), the clock stays at 0:00 in the warning colour. Late hand-ins are marked late and can still be judged.
Defaults: 60 s per question, extra window in the first 20 s, warning colour in the last 10 s.
Why manual start: an auto-start eats the reading time.

**D15. Verdicts can always be corrected; scores are computed, never stored.** *agent*
Verdicts are toggles. Any verdict can be changed until the game ends; past questions are corrected from the breakdown.
Scores are summed from the verdicts every time, so a correction cannot put them out of step.

**D16. Ties share a place (1, 1, 3).** *agent*
No hidden tiebreak. If a single winner is needed, the teacher plays one more question.

**D17. Teams: 2 to 8.** *agent*
Why: eight rows fit on the card at projector size with readable names; more would need two columns and smaller text.

### Questions and AI

**D18. A "Questions" step between setup and the wheel.** *agent* — **Spec change** (the brief's flow goes setup → wheel)
The teacher picks a saved set, pastes, types, or generates; reviews and edits the list; then starts.
Why: the brief had a source switch but nowhere to write, paste, review or save questions, so unreviewed AI questions
would reach the projector.

**D19. Paste import in a plain-text format.** *agent*
One block per question: type, question, answer. The teacher can prepare it in Word or any chatbot.
Why: typing 10–30 questions into form fields is slow.

**D20. AI generation: OpenAI API, paid from the owner's ChatGPT Pro monthly API credits.** *owner*
One Vercel JS serverless function; signed-in teachers only; a daily limit per teacher. The teacher enters topic, grade,
language and the number of questions per type (for a sandiqcha: the object). Every generated question is reviewed
and editable before the game. Provider code stays in one file so it can be swapped.
Why: the credits are already paid for ($100–$500 a month by Pro tier, per OpenAI's API-credits page, read 2026-11-11).
Risk accepted: generation stops if the Pro subscription ends; the credits expire monthly.
No Python: a JS function does the job in the same language as the app.

### Language and display

**D21. Uzbek in Latin script only; one language per question set; the UI switch is separate.** *agent*
Uzbek uses the ASCII apostrophe in o', g' (the Axeno rule); text pasted with ʻ ‘ ’ is normalised on import.
Why: PDP School's own site uses Latin; mixed apostrophes break search and some fonts draw them wide.

**D22. Hidden scores are hidden on screen for everyone; the teacher can switch them on mid-game.** *agent*
The leaderboard always shows scores. Why: with one screen (D4) "hidden from students" also hides them from the teacher.

**D23. Wheel: one pocket per question; used pockets turn grey and stay.** *agent*
Why: removing pockets would reshuffle the wheel's geometry after every spin and move the numbers. The brief allowed either.

**D24. Each question type has its icon and name as well as its colour.** *agent*
Why: projectors wash colours out, and some students are colour-blind (colour must never be the only signal).

**D25. Question text size fits its length.** *agent*
The largest size that fits the card, never below a floor readable from the back row (set in M0, checked on screenshots).
Why: a sandiqcha question is a short story and overflows at a single "large" size.

**D26. Logo: the owner asks PDP for the SVG; until then, the official 114×41 webp at its native size.** *owner*
Why: the only full logo on school.pdp.uz is a small raster file; the vector there is the round mark only.

**D27. `docs/plan.md` approved as written.** *owner*
Includes local commits at the end of each milestone. Push and deploy still wait for the owner's OK.

## 2026-11-11 — M0 (foundations)

**D28. Onest is bundled with the app (`@fontsource-variable/onest`), not loaded from Google Fonts.** *agent*
Why: no third-party request from a classroom; the font is there whenever the app is.

**D29. A dev-only token sheet at `/dev/tokens`.** *agent*
Shows the type scale, the colours and the timer digits. It is the fixture for visual checks at the three sizes;
production builds do not include it. Why: Axeno's lesson — anything that renders must be loaded, and a fixture
makes the check repeatable.

**D30. React Router 7 and Vitest 5 instead of the planned 6 and 3.** *agent* — changes `plan.md` §2
Why: `npm audit` on the planned versions found 5 advisories. React Router 6 has an open redirect in `<Link>` and
`useNavigate`. Vitest 3 pulls a tinypool version with a critical advisory (dev-only). After the upgrade, the audit
reports 0. React 18 and Vite 6 stay: React Router 7 supports React 18; Vitest 5 supports Vite 6.4.

## 2026-11-11 — M1 (game engine)

These settle details that D6–D17 left open. All of them are *agent* decisions; the owner can overrule any of them.

**D31. The extra pre-selection is a suggestion; only the teacher's tap scores.** *agent* (how D7 is built)
The engine computes each hand-in's status: extra, in time, or late. The card (M4) highlights "correct + extra" for teams
inside the window. No points are given until the teacher taps a verdict.
Why: an automatic verdict would score a wrong answer that was simply handed in early.

**D32. A hand-in needs a started timer; Reset clears the hand-ins.** *agent*
Before Start, a tap on a team does nothing. Reset (a restart of the question) clears the timer and the hand-ins,
because their times were measured from the old start. The reveal and the verdicts stay.

**D33. The clock keeps counting past zero; the display stops at 0:00.** *agent*
Why: a slip that arrives after zero is recorded as late (D14), and the teacher still judges it.
An extra window of 0 seconds turns the bonus off. If the extra window runs into the warning time, the extra colour shows.

**D34. A played pocket can be reopened to fix a mistake.** *agent*
Its round (time, hand-ins, verdicts) is kept. Closing the card stops its timer.
Why: the teacher may close a card before judging every team.

**D35. Team names: 1–40 characters, unique (ignoring case and spaces).** *agent*
Why: two teams with the same name would be impossible to tell apart on the card and the leaderboard.

**D36. Paste format details.** *agent* (extends D19)
- The type prefix is optional; a block without one is an Oddiy savol.
- The type may stand on its own line. Numbering ("1.", "2)") is ignored.
- Type names and the answer label are accepted in Uzbek (Latin and Cyrillic), Russian and English, in any letter case.
- A colon inside the question text stays text unless the word before it is a type name.
- When the set is copied back out as text, Russian uses "Обычный / Директор / Ящик" and "Ответ".
  These Russian names are placeholders: the owner chooses the Russian names of the three types (fixlist F9).

**D37. An unreadable saved game is set aside, not deleted.** *agent*
It is moved to `zakovat.game.unreadable`, so nothing is lost silently. Older schemas are upgraded through a migration
table; none exist yet (schema 1).
