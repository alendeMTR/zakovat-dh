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
**Superseded 2026-11-11 by D61** (Codex may edit files and commit). The CLI version below was the one installed
when this was written; the owner updated it to 0.167.1 the same day.
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
**Superseded 2026-11-12 by D73** (owner): a played pocket leaves the wheel when its card closes.
Why: removing pockets would reshuffle the wheel's geometry after every spin and move the numbers. The brief allowed either.

**D24. Each question type has its icon and name as well as its colour.** *agent*
Why: projectors wash colours out, and some students are colour-blind (colour must never be the only signal).

**D25. Question text size fits its length.** *agent*
The largest size that fits the card, never below a floor readable from the back row (set in M0, checked on screenshots).
Why: a sandiqcha question is a short story and overflows at a single "large" size.

**D26. Logo: the owner asks PDP for the SVG; until then, the official 114×41 webp at its native size.** *owner*
**Changed 2026-11-12 by D80:** the owner sent the round mark as a PNG; it is the logo now.
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

## 2026-11-11 — M2 (main page, setup, questions)

**D38. The game being prepared (the draft) is kept in the browser, and stays after the game starts.** *agent*
Setup and questions are saved after every change, so a reload does not lose typed questions. After a game starts,
the same set can be played again with another class. "Clear list" empties it, after a confirmation.

**D39. Setup defaults: 4 teams; an empty name becomes "3-jamoa" / "Команда 3".** *agent*
The default follows the interface language. The warning time (10 s) is not a setup field: one setting less.

**D40. A paste with any error adds nothing.** *agent*
The teacher sees each broken block with its line number, fixes it, and adds again.
Why: a half-added set is harder to fix than an unchanged text box. Adding beyond 30 questions is refused the same way,
with the number that still fits.

**D41. Starting a game over an unfinished one asks first; a finished one is replaced without asking.** *agent*
Why: an unfinished game may be a reload away from being lost. A finished game's results were already shown; keeping
finished games is M6, for signed-in teachers.

**D42. Russian type names in the interface are placeholders: "Обычный вопрос / Вопрос директора / Чёрный ящик".** *agent*
"Чёрный ящик" is the name Russian speakers know from "Что? Где? Когда?". The owner chooses the final names (fixlist F9).

**D43. Until M3, "Start game" opens the main page, where the new game shows under "Continue".** *agent*
"Continue" links to `/game`, which M3 builds. Until then it opens the not-found page.
**Superseded 2026-11-11 by M3:** "Start game" and "Continue" open the wheel.

## 2026-11-11 — M3 (the wheel)

**D44. The wheel's hub is the spin button, labelled "Aylantirish"; no logo in the centre.** *agent*
(The brief left the logo in the centre to the agent.) Why: a labelled hub tells the teacher where to click. A logo there
would look like decoration and hide the control. The PDP mark can still go on the hub later, beside the label, if the owner wants it.

**D45. Wheel layout: navy rim, pockets coloured by type, white bowl, navy hub; a white pointer at the top.** *agent*
Pocket numbers turn with the wheel; the one under the pointer is upright. Direktor and sandiqcha pockets also show
their icon (D24). Number size follows pocket width: 64 units for 10 pockets, 35 for 30. Numbers stay clear of the
pointer's tip.

**D46. A spin always turns forward 5–6 turns, about 4 s, and stops inside the chosen pocket, never on an edge.** *agent*
The engine picks the pocket (`pickPocket`); the animation only shows it. After landing, the pocket is outlined for half a
second, then its card opens. While the card is open the pocket keeps its colour; it turns grey when the card closes.

**D47. Space spins the wheel (when no control has focus and no dialog is open).** *agent*
Why: the teacher can spin from the keyboard without aiming at the hub. Presentation clickers (Page Down) are not mapped,
to avoid accidental spins; this can be added if teachers ask for it.

**D48. The game screen keeps the language switch in its top bar.** *agent*
Why: a teacher in a mixed class may switch mid-game. The switch changes only the interface, never the questions (D21).

**D49. Until M5, "End game" (after its confirmation) opens the main page.** *agent* (fixlist F12)

## 2026-11-11 — M4 (the question card)

**D50. The card covers the wheel area but not the top bar.** *agent*
Why: scores, sound and End game stay within reach while a question is open (D22: scores can be switched mid-game).

**D51. The card has a fixed height; the question gets the space the rest leaves, at the largest size that fits.** *agent* (builds D25)
Order: type band → timer (about a fifth of the card) → question → answer → team rows. The question is sized between
3.7u and 6.6u (40–71 px at 1080). If even 3.7u does not fit, the question starts at the top and its box scrolls; the text is never clipped.

**D52. Keys on the card: Space starts or pauses the timer; 1–8 record a team's hand-in; Escape returns to the wheel.** *agent*
Why: the teacher stands with slips in hand; one key per slip is faster than aiming at a row. A line at the
bottom of the card names the keys. A tap on the team's row does the same.

**D53. The zero tone is two short beeps (Web Audio, no file). At zero, Start and Pause disappear; Reset stays.** *agent*
Browsers allow sound only after a gesture; any tap or key press on the card counts, so the tone also works after a
reload. It plays once, when the card sees the time run out, not again after a reload past zero.
Reset asks first when hand-ins would be lost (D32).

**D54. Team rows: two columns above four teams; the hand-in status sits under the team name.** *agent*
(Settles the plan §5 risk.) Why: eight rows in one column leave too little room for the question on a 768-high screen.
The status moved to its own line after a long status cut "Burgutlar" to "Burgutl…" at 1280×720.

**D55. Verdict buttons: ✓✓ correct + extra (solid green), ✓ correct (green outline), ✕ wrong (solid red-pink).** *agent*
Each has a spoken name and a tooltip. The suggestion (D31) is a dashed green outline on ✓✓ for teams inside the extra window.
The row shows this question's points (when above 0) and the team's total; both hide with the scores (D22).

**D56. The timer bar fills with elapsed time; the extra window is a green stretch at its start.** *agent*
A line under the digits names the phase ("Qo'shimcha ball vaqti", "Vaqt tugayapti", "Vaqt tugadi", "Pauza"…),
so colour is not the only signal (D24).

## 2026-11-11 — M5 (end of game)

**D57. "End game" opens the leaderboard. Opening the game screen after the end leads there too.** *agent* (closes F12)

**D58. The leaderboard is read from the back row: sized in --u, first place tinted, one screen at any team count.** *agent*
Each row: place (shared on ties, D16), team, "To'g'ri: 9 · qo'shimcha ball bilan: 1", score. Above five teams the rows
get tighter, so eight teams and the buttons fit a 720-high screen. Scores always show here, even if hidden during the game (D22).

**D59. The breakdown is a document page: one row per question in the order played, a column per team.** *agent*
- Each mark shows its icon and points, with the hand-in time under it.
- A click on a mark opens a small dialog: the three verdicts, "remove the mark", and Cancel. Totals update at once (D15).
- Questions never played are counted in a note, not listed.
- It prints on A4 landscape, without the buttons.

## 2026-11-11 — Codex joins the build

**D61. Codex may edit files, run commands and commit locally; it continues the build from M5.** *owner* — changes D1
The owner updated Codex (CLI 0.167.1) and said: "It now can edit files". D1 had Codex as a read-only reviewer.
Rules for both models stay in `CLAUDE.md` (via `AGENTS.md` for Codex). Push and deploy stay with the owner.
The brief keeps design decisions and visual review with the main model, so a UI change from Codex is not "verified"
until someone has looked at it at 1920×1080, 1366×768 and 1280×720. If Codex cannot take screenshots, it leaves a
"visual check pending" row in `docs/fixlist.md`.

**D60. The main page shows the last finished game (when it ended, the winner or winners, a link to its results).** *agent*
It stays until a new game replaces it. Why: a teacher who leaves the results by mistake can get back to them.
Keeping more than one past game is M6 (accounts).

## 2026-11-11 — the F18–F21 and F14 round

All *agent* decisions, under "decide, log, keep going". The owner can overrule any of them.

**D62. An open modal owns the keyboard, and the card's keys are a pure rule.** *agent* (fixlist F19; builds D52)
While any `<dialog open>` is on screen, the question card ignores every key, so Escape in the End game or the
reset confirmation closes only that confirmation. The wheel's Space does the same. The rule itself moved to
`src/play/cardKeys.js` (`cardKeyAction`), which is pure and tested; the card only translates the result into actions.
Why: the bug was invisible in a lesson — Escape closed the card under the dialog and stopped that question's timer,
and every later hand-in was then measured against a stopped clock.

**D63. After zero, Space does nothing, and the keys line stops naming it.** *agent* (fixlist F19; builds D33, D53)
At zero the display holds 0:00 but the clock keeps counting, so a late slip still gets a real time (D33). Pause is
hidden there (D53), and Space must not pause either: a pause freezes the elapsed time and stamps every later hand-in
with the same wrong moment. Space is still swallowed at zero so it cannot scroll the page. The line at the foot of
the card then reads "1–{n} — jamoa javob topshirdi" alone (new draft key `card.keysDone`, F10).
Space on a focused button stays that button's own key, as D47 and D52 intend.

**D64. A saved game is checked against the engine's own boundary and against what is actually stored.** *agent*
(fixlist F21; builds D37)
`loadGame` runs the saved teams, questions and settings back through `createGame`, and then checks the parts
`createGame` cannot see: the ids, the language, `current` against `played`, one round per played pocket, and each
round's timer, hand-ins and verdicts. Settings are checked twice over, because `createGame` fills missing values from
the defaults: a game stored with `points: null` passed the boundary and then broke scoring. Anything that fails goes
to `zakovat.game.unreadable` (D37) and the teacher gets a clean main page instead of a blank one.
Reading the browser storage property itself is now inside a try, since a locked-down browser throws on the getter.

**D65. `createGame` enforces whole numbers in range for time, bonus and points.** *agent* (fixlist F18)
The same ranges setup uses (`LIMITS.points`, now shared with `POINTS_MAX`). Fractional, `null`, `NaN`, `Infinity` and
string values are refused, not silently compared. The Questions step maps the new `points` error to the settings
error it already shows, which links back to setup.
The wizard step link stays open: moving between the two steps is useful, and the refusal belongs at Start, where the
teacher is told which setting is wrong. The draft text of `questions.startError.settings` now says time **and** points.

**D66. The questions list flags a question over 250 characters.** *agent* (fixlist F14; does not change D51)
`isLongQuestion` in `src/setup/draft.js`. The line under the question names its length and says it may have to be
scrolled on a small screen. The card is untouched: it still fits the text and scrolls as a last resort (D51).
Why 250: a 372-character question did not fit at 1280×720, and the longest sample question is 124.

**D67. Confirmation dialogs take their heading id from React's `useId`.** *agent* (fixlist F20)
Two mounted `ConfirmDialog`s shared the id `confirm-title`, so End game was announced as the timer-reset question and
Replace game as Clear list. One id per instance; nothing else changes.

## 2026-11-12 — the stand-in review of M0–M5

The Codex review is still blocked (F8), so the agent reviewed its own and the earlier milestones as an outsider.
All *agent* decisions; the owner can overrule any of them. The review did not change a single game rule.

**D68. The draft is validated as deeply as the saved game, and an unusable one is set aside.** *agent*
(fixlist F22; extends D37 and D38)
`isDraftShape` now checks every question (a non-empty id, a type the icons know, string text and answer), the team
names, the team count and the list length. A draft that fails goes to `zakovat.draft.unreadable` and the teacher gets
an empty one. Why: before this, one question with an unknown type blanked the Questions step on *every* visit, with
nothing in the UI to clear it — the one place in the app where bad stored data could lock a teacher out for good.
Number fields stay loose on purpose: they hold `null` while the teacher is still typing, and `validateSetup` reports
those. **This adds one storage key** (`zakovat.draft.unreadable`), which mirrors D37's key for the game rather than
inventing a new idea; the owner can veto it, in which case the fallback is to drop the bad draft silently and lose
whatever was typed.

**D69. The wheel rests on the pocket whose card is open, not on the last one played.** *agent* (fixlist F23; builds D34, D46)
**Changed 2026-11-12 by D73:** with no card open the wheel rests on a seam; the last played pocket is no longer on the wheel.
`restingPocket(game)` in `wheelGeometry.js`, used by `GamePage`'s initial rotation. Why: after reopening an earlier
pocket and reloading, the pointer named one pocket while the card and the highlight named another — on a projector
that is the screen contradicting itself in front of the class.

**D70. Keyword lookups use plain `toLowerCase`, never the device's locale.** *agent* (fixlist F24)
In `paste.js`'s `typeOf` only: the type words are an ASCII keyword list, and on a Turkish or Azerbaijani machine
`toLocaleLowerCase()` turns "DIREKTOR" into "dırektor", so the type was lost. Team-name comparison in `createGame`
and `validateSetup` keeps `toLocaleLowerCase`: those are people's names, locale folding is the right rule there, and
both sides use the same function so they cannot drift apart.

**D71. The engine is checked by a randomised sweep as well as by examples.** *agent*
A scratch harness (kept outside the repo, `%TEMP%\zakovat-check\`) drives `reduce` through 3000 random sequences of
legal and illegal actions and asserts the invariants a teacher depends on: one round per played pocket, no verdict
before the reveal, hand-in stamps that never move on their own, the clock never running backwards or on a closed
card, totals that always match the verdicts, shared places for ties, and — the one that guards D64 — that no state
reachable by legal actions is ever set aside by the loader. A second harness throws 20000 malformed pastes at
`parsePaste` and checks that anything it accepts, `createGame` accepts too. Both pass. Why keep them out of the repo:
they are slow and they are a review tool, not a specification; the behaviours they pinned down that matter are in
the committed tests.

## 2026-11-12 — owner's design feedback round

The owner's feedback (2026-11-12): the platform looked empty, the text was too small, the main page should follow
Axeno (a header, a background drawing, no centred generic block), the ranking needed details, the legend sat too
close to the wheel, a picked question should leave the wheel with a keep-or-remove choice, deleting a question should
ask first in a styled dialog, the clock should stop once every team is scored, and the results page should use gold,
silver and bronze with an animation. "Everything is on you, treat it as feedback." Decisions marked *owner* below are
the owner's request; how they are built is the agent's call and can be overruled.

**D72. The clock stops once every team on the open question has a verdict.** *owner* — game rule (builds D33)
The owner's words: "time should stop when every team's scores have been typed." In `reduce`, the `SET_VERDICT` that
gives the last team on the open card its verdict also stops a running clock, at that action's time. Clearing a verdict
afterwards does not restart it; the teacher can press Resume before zero. The phase line then reads "To'xtatildi:
barcha jamoalar baholandi" instead of "Pauza", so it is not taken for a pause. Why it is safe: D33 kept the clock
running for late slips, and once every team is judged there is no slip left to time.

**D73. A played question leaves the wheel; the spin ends in a result dialog: open it, or keep it on the wheel.** *owner*
— **supersedes D23** ("used pockets turn grey and stay")
- After landing, a dialog after the "The result is…" box of popular wheel apps shows the pocket number large, its type
  (colour band, icon, name) and a line for that type (the director asks it; bring the box out). Two actions:
  **Savolni ochish** (opens the card; focused, so Enter or Space opens it) and **G'ildirakda qoldirish** (nothing is
  recorded, the pocket stays, the teacher spins again — for example, the director has not arrived). × and Escape keep it.
- An opened pocket leaves the wheel when its card closes; the rest close up and keep their numbers. The pointer then
  rests on the seam where it was, so no pocket looks picked. With every question played the ring is empty and grey.
- **How "keep or remove" was read (agent; the owner can redirect):** "remove" is opening the question, since a picked
  question is played and then leaves. There is no "remove without playing" (dropping a bad question mid-game): that
  would need a new stored state, so it is left as a question for the owner (fixlist F26).
- The stored game does not change: "kept" is simply not opened. D34 stays: a played question is reopened from the list
  in the left panel (D74) and is back on the wheel while its card is open. D69 changes with it: with no card open the
  wheel rests on a seam, not on the last played pocket, which is no longer drawn.

**D74. The game screen is three blocks of equal height: questions panel, wheel, ranking panel.** *agent*
The panels stand at the outer edges, level with the wheel (76 units, down from 80), with 6 units of air between
(owner: the legend sat too close to the wheel). Left, "Savollar": played out of total with a bar; each type with how
many are left of how many; the played questions, newest first, each with how many teams got it right and a button
that reopens it. Right, "Reyting": place (gold, silver, bronze once a team has points), name, right answers and extra
bonuses as the card's own ✓ and ✓✓ icons, the places moved and points earned on the last question, the score, and a
footer on the last question (how many right, the fastest correct hand-in). Six or more teams use tighter rows. With
scores hidden (D22) the panel lists the teams only, with a note on how to show scores, so the screen keeps its shape
and nothing about the standings shows. Pure helpers in `scoring.js`: `focusPocket`, `roundPoints`, `placeMoves`,
`roundSummary` (tested).

**D75. The results page: a podium in gold, silver and bronze, revealed third → second → first.** *owner* (colours,
animation) / *agent* (design)
Reference: the staggered podium reveal that quiz platforms use and their users ask for (a Kahoot community request,
Crowdpurr's winner reveal, a published podium-animation walkthrough; searched 2026-11-12). The steps rise one after
another, the scores count up, one light sweep crosses the winner's step, then the full table and three facts appear:
the fastest correct answer, the hardest question, the most extra bonuses (`gameInsights`, tested). Step height and
colour follow the **place**, so teams sharing a place stand level (D16). With reduced motion everything is in place at
once. The page still fits one 720-high screen with eight teams (D58). Medal tokens `--gold`, `--silver`, `--bronze`
(fills, with navy text) and their `-tint` and `-ink` shades; contrast measured in `tokens.css`. The breakdown and the
ranking panel use the same medals.

**D76. The main page follows axeno.uz: a header, a left-aligned hero over a drawing of the wheel, then real content.**
*owner* — **Spec change** (the brief: "one primary button… little else"; "no banners or illustrations")
The owner asked for it on 2026-11-12. The header carries the school and product names, links to the sections below
and the language switch (the logo still waits on F1). The hero: a plain title ("Sinfda Zakovat o'tkazing"), one
sentence on how the game works, the one primary action "Yangi o'yin", and three facts (2–8 teams, up to 30 questions,
3 types). The background is the game's own wheel, drawn with the same geometry in faint brand blue — not a stock
illustration. The unfinished or last game shows as a card beside the text. Below, on squared paper as on Axeno: how a
game runs (four steps), the three question types with their rules and default points, the keyboard keys, and a footer
line saying the game is kept in this browser. One primary action stays, as the brief wanted.

**D77. The setup and questions steps get a live "game summary" column, with an estimated length.** *agent*
Beside the form on screens over 1100 px: teams, time, questions by type, points, and roughly how long the game will
take — each question's time plus one minute for reading, the reveal and grading (`estimateMinutes`, tested). Why: the
teacher plans a 45-minute lesson, and the page was a narrow column with empty sides. The minute is an estimate; the
owner can tune it after a real lesson (fixlist F27).

**D78. Deleting a question from the list asks first, in the app's own dialog.** *owner*
The existing `ConfirmDialog` (styled, built on `<dialog>`, Cancel focused first so Enter never deletes by accident)
quotes the first 90 characters of the question. The browser's `confirm()` is not used anywhere in the app.

**D79. The type scale is larger everywhere, and the breakdown table has a clear hierarchy.** *owner*
**Changed 2026-11-12 by D81:** the sizes came down halfway (the owner found them a little too big); the structure stays.
The owner: "too small… didn't even understand the structure of the table, names of teams are the same size as scores."
The UI root is now 17–20 px (was 16–20) and every step of the scale is raised (the label floor from 15 to 16 px on a
laptop). On the stage a new floor, `--st-small` (2 units: 15 px at 768, 22 px at 1080), replaces the 1.4–1.7-unit
sizes, and labels, team names and scores grew. The breakdown: team names head their columns in bold at heading size,
with the team's place and total under them; team columns are framed; rows alternate; each question shows its type by
name; the totals row says "Jami ball" and is large. The 8-team question card still fits 1280×720 without scrolling,
with the question at 40 px (D51).

**D80. The PDP mark the owner sent is the logo: in the header, the game bar and the tab icon.** *owner* — changes D26
On 2026-11-12 the owner sent the school's round mark (the white S on navy) as a 640×640 PNG, 180 KB. It is used as
given, never redrawn, from `public/pdp-mark.png`: beside "PDP School" in every page header (40 px) and in the game's top
bar (32–48 px, in --u), and as the browser tab icon and touch icon. Its alt text is empty because the school's name
follows it as text. The 114×41 webp from school.pdp.uz is no longer needed. If PDP later sends an SVG, it replaces the
PNG in the same place (lighter, and sharp at any size); nothing else changes.

**D81. The type scale settles between the first one and D79: distinct levels, not large text.** *owner* — changes D79
The owner, after D79: "fonts are a little too big everywhere. I meant they should be distinct and readable." The UI
root is 16–19 px (D79: 17–20). Body text is 17 px on a laptop and 20 px at 1080; headings step up by about a quarter
each (17 → 21 → 26 → 36 px on a laptop, display 52), so a heading never reads as body text; the label floor stays at
15 px. On the stage: `--st-small` 1.9 units, `--st-label` 2.1, `--st-team` 2.6 (as before D79), `--st-score` 3.4.
D79's structural changes stay: the breakdown's headed and framed columns, the counts as icons, the stage floor.
The setup summary now lines up with the first panel through a grid row for the step links and the title, instead of a
fixed margin that broke whenever the title's size changed. Checked at 1920×1080, 1366×768 and 1280×720: every screen
fits as before, nothing is cut, and the 8-team question is 42 px at 1280×720 (it was 40).
