# Handoff

> Read this first, every session. Stable sections on top; the Session Log below keeps the **newest five entries**.
> When you add a sixth, move the oldest to `docs/archive/handoff-YYYY-MM.md`, unedited.

---

## 1. Where it stands

- **M0–M5 are done and committed: the core game works end to end in the browser, with no accounts.** The plan is approved (D27).
- **F14, F17–F21 (2026-11-11) and F22–F24 (2026-11-12) are fixed and committed.** Nothing is pushed or deployed.
- **Nothing substantial is left on the agent's side.** Preview 1 needs F4 (GitHub and Vercel), M6 needs F2
  (Firebase), M7 needs F3 (API key), and the Codex review needs F8. F5 and F7 are now ⏸ with the owner too:
  the agent took both as far as it can and wrote what it found in their rows.
- Decisions: `docs/decisionlog.md` D1–D71. Older Session Log entries: `docs/archive/handoff-2026-11.md`.
- **`docs/owner-guide.md`** (written 2026-11-11, **brought up to date 2026-11-12 for the deploy**): what the owner
  tests — including §2C, one line per fix from the two bug commits, in his terms — what not to flag yet, the
  manual setup steps, and how Codex can take over. §4.2 is now a step-by-step Vercel checklist (Vite preset,
  `dist`, Node 22.x, no environment variable yet, and the deep-link reload check against `vercel.json`).
- The owner will do the account and tool to-dos later (2026-11-11: "I will do everything manual later"):
  - F8: run the Codex reviews. **Corrected 2026-11-12:** Codex is *already* updated (0.167.1, D61) — the line
    here used to say it still had to be. Nothing is blocked by tooling; the reviews have simply not been run,
    so every commit so far is unreviewed by Codex.
  - F1: OK to download the interim logo files.
  - F9: approve the sample sets and the Russian type names. F10: approve the interface text.
  - F2 (Firebase, by M6), F3 (API key, by M7), F4 (GitHub and Vercel, by Preview 1).

## 1b. Game engine map (`src/game/`, pure JS, no React)

| File | Holds |
|---|---|
| `constants.js` | Types, verdicts, limits, default settings and points (D9, D14, D17) |
| `game.js` | `createGame` (validation, shuffled numbered pockets), `reduce(game, action)`, `pickPocket` |
| `timer.js` | Elapsed / remaining from timestamps, `timerPhase` (colours), `handInStatus`, clock text |
| `scoring.js` | `pointsFor`, `teamTotals`, `ranking` (shared places), `breakdownRows` |
| `paste.js` | `parsePaste` → `{ questions, errors }`, `formatPaste`, `normalizeUz` (ASCII case folding, D70) |
| `storage.js` | `saveGame` / `loadGame` / `clearGame` in `localStorage`; unreadable or broken data set aside (D64) |
| `sampleSets.js` | The uz and ru sample sets (draft, F9) |
| `testHelpers.js` | Test builders only; the app never imports it |

Actions: `OPEN_QUESTION {pocketNo}`, `CLOSE_QUESTION {now}`, `START_TIMER {now}`, `PAUSE_TIMER {now}`, `RESET_TIMER`,
`HAND_IN {teamId, now}`, `REVEAL`, `SET_VERDICT {pocketNo, teamId, verdict}`, `TOGGLE_SCORES`, `TOGGLE_SOUND`,
`END_GAME {now}`. An action that is not allowed returns the same object.

## 2. Stack and commands

- React 18.3 + Vite 6.4, React Router 7 (D30), plain CSS with tokens (`src/styles/tokens.css`), lucide-react,
  Onest bundled via `@fontsource-variable/onest` (D28). Tests: Vitest 5. Node 22.x.
  Later: Firebase Auth + Firestore (M6), one Vercel JS function for AI (M7).
- `npm run dev`: dev server on **http://localhost:5180** (`.claude/launch.json` → `zakovat-dev` for the browser pane).
  If 5180 is taken by another project on this machine, `npm run dev -- --port 5181` and check there.
- **If the browser pane will not connect:** drive headless Chrome over the DevTools protocol instead — launch
  `chrome.exe --headless=new --remote-debugging-port=…`, then `Input.dispatchMouseEvent` / `Input.dispatchKeyEvent`
  for real clicks and keys, `Emulation.setDeviceMetricsOverride` for the three sizes and `Page.captureScreenshot`.
  There is a worked example in the owner's Axeno repo (`.axeno-docs/research/phone-harness/cdp.mjs`, read only).
  Keep the driver outside this repo. Note that `<input type="number">` ignores half-typed values like "-", so set
  those fields with `Input.insertText` over a selection rather than key by key.
- `npm run check`: i18n check, lint, tests, build (all four; run it before every commit).
- `npm run check:i18n`: uz and ru have the same keys, no empty values, ASCII apostrophes in uz, no unknown `t("key")`.
- `/dev/tokens` (dev server only, D29): every token on one screen; the fixture for screenshots at the three sizes.
- Visual check sizes: 1920×1080, 1366×768, 1280×720, set with the browser pane's `resize_window`.
- **Browser pane trap (2026-11-11):** while the pane is hidden, screenshots of an emulated 1920×1080 or 1366×768
  viewport can come back cropped to the top-left 1280×720 or stale (an earlier frame). Wait about 3 s and take the
  screenshot again: it usually repaints in full. Verify state and layout with JS too (bounding boxes, `scrollWidth`,
  `localStorage`). Do not scale the page with a CSS transform to fit it: once the pane repaints, the screenshot
  shows the scaled page.
- **Test games without clicking through setup:** in the dev server's page console,
  `const {createGame, reduce} = await import('/src/game/game.js')`, build a game (sample questions from
  `/src/game/sampleSets.js`), `saveGame` it from `/src/game/storage.js`, then open `/game`. Used for the 10/20/30-pocket checks.
- Milestone review: `codex review --uncommitted` before the milestone commit (D1), or `--commit <sha>` afterwards.
  The installed CLI is **0.167.1** (updated by the owner on 2026-11-11, D61). The note that `--uncommitted` refuses
  custom instructions and reads `AGENTS.md` → `CLAUDE.md` instead was observed on 0.142.0; re-check it on 0.167.1.

## 2b. Layout rule for game screens

Game screens (wheel, card, results) size everything in `--u` = 1% of the largest 16:9 box that fits the window.
A projected 768-high image then reads like a 1080-high one, because readability on a projector depends on a size's
share of the screen, not on its pixels. UI screens (main, setup, questions) use rem on a root of 16–20 px.

## 3. Sources used in research (2026-11-11)

- PDP School brand: school.pdp.uz (colours read from its CSS: navy `#0b1a66`, blue `#2040ff`, mark `#2168F2`,
  pink CTA `#ffa2bc`→`#ff0165`, accent `#ff5c98`, green `#3ee08f`; font Onest). Logo: `/site/pdp/img/logo-yorug.webp`
  (light) and `logo-tungi.webp` (dark), 114×41; round mark as SVG at `/assets/favicon.svg`.
- Zakovat format: one kun.uz broadcast report (Jan 2024) and the @zakovat Telegram channel. The official rules PDF
  was not retrievable (F7).
- Codex and API credits: OpenAI's pricing page (learn.chatgpt.com/docs/pricing) and API-credits page
  (developers.openai.com/api/docs/guides/chatgpt-api-credits).
- Design and docs system: the owner's Axeno repo (`Desktop/axiomanodev1`), read only.

---

## 4. Session Log

### 2026-11-12 (later) — owner guide brought up to date for the deploy

Documentation only; no code touched. The owner is about to commit, push and deploy from
`docs/owner-guide.md`, which still described M5 (`bb393c9`).

- **§1** now states where things actually stand: the two commits since M5 in plain terms, the eight fixed items
  waiting for his test (F14, F18–F24), the fact that the review found no fault in the game rules, the current
  counts (175 keys, 111 tests), and the "Port 5180 is already in use" fallback.
- **§2 has a new section C**, "New since you last looked": one numbered line per fix, in his test terms rather
  than F-numbers — the long-question flag, the refusal at Start with the step-link bypass, Escape inside a
  confirmation, the clock after zero, the two set-aside promises, and the wheel pointer after a reload. The old
  §2C (text to approve) became §2D.
- **§3 went through line by line.** The row telling him not to flag long questions was wrong now that F14 is
  built — it would have cost him a real test — and was rewritten to cover only the scrolling that is still by
  design (D51). Six rows were added for behaviour that looks like a bug and is not: Pause gone at 0:00, the clock
  counting past a frozen 0:00, Space pressing a focused button instead of spinning, the step link staying open,
  and the two `.unreadable` storage keys.
- **§4.2 is now a deploy checklist he can follow signed in to Vercel:** no environment variable yet and why,
  the Vite preset with `npm run build` and `dist`, Node 22.x to match `engines`, what `vercel.json` already does,
  and the deep-link reload check (`/game`, `/game/results`, F5) as the first thing to try — with a note that a
  redirect is the app working and only a 404 is a failure. §4.3 and §4.4 now say plainly that Firebase and the
  API key belong to M6 and M7.
- **Two documents disagreed, and the guide was the stale one.** D61 says the owner updated Codex to 0.167.1 on
  11 Nov; F8, this handoff and guide §4.1 all still said the CLI was 0.142.0 and too old to run. The install
  settles it — `~/.codex/packages/standalone/current` points at the 0.167.1 release, with 0.142.0 kept as the
  previous one. **D61 was right; F8, handoff §1 and guide §4.1 were corrected.** Codex is not blocked by tooling:
  the reviews have simply never been run, and that alone is what keeps F8 open. (No Codex command was run here.)
- Smaller corrections: the review backlog in §4.1 now lists `4395de5` and `9e87a90` too; §5 says D1–D71, not
  D1–D60; the Codex hand-over prompt no longer tells him to override a read-only line that `AGENTS.md` stopped
  having at D61; §4.5 gained F5 and F7 with what closes each. In `fixlist.md`, eight rows that said "Fixed
  locally" in words now use the 🔧 the file's own legend defines. In `decisionlog.md`, D1 gained the
  "superseded by D61" line it was missing (the way D43 carries one); its text is otherwise untouched. In this
  file, §2's `codex review` note now says which CLI the `--uncommitted` limitation was seen on.
- **Checks:** `npm run check` passes: 175 keys, 111 tests, lint, build. `git status` shows only the three docs.
- **Next:** unchanged — the owner pushes and deploys (F4), then M6 (F2), M7 (F3), and the Codex reviews (F8).

### 2026-11-12 — stand-in review of M0–M5 and `4395de5`

No commit had been reviewed by Codex (F8), so the agent reviewed every milestone commit as an outsider trying to break it,
concentrating where a failure costs a lesson. **F8 stays open regardless: this does not replace the Codex pass,
it covers the gap until the owner updates the CLI.** Nothing pushed, nothing deployed, no accounts.

- **How it was reviewed.** Read every engine and screen file against the decisions on its subject, then two
  randomised sweeps (scratch harnesses outside the repo, D71): 3000 random action sequences through `reduce`
  checking the invariants a teacher depends on, and 20000 malformed pastes checking the parser's contract with
  `createGame`. Then browser probes for each suspicion the reading raised.
- **The engine held.** No invariant broke in the 3000 sequences (coverage: 4853 verdict changes, 6985 hand-ins,
  2305 reveals, 1640 resets, 788 reopened pockets, 8503 ties observed, 12713 late and 29765 extra hand-ins).
  Totals always matched the verdicts, ties always shared a place, no verdict ever existed before its reveal, no
  hand-in stamp moved on its own, no clock ran backwards or kept running on a closed card, and **no state reachable
  by legal play was ever set aside by the loader** — the invariant that guards the F21 work. The parser never threw,
  never returned a question `createGame` would refuse, and round-tripped through `formatPaste` every time.
  Spot checks of the logged decisions against the code (D9, D13, D14, D16, D17, D22, D24, D33, D35, D45, D46,
  D51, D53, D54, D58, D59) found no drift.
- **Three findings, all fixed, each with a test that was mutation-checked (the old line put back, the test fails):**
  - **F22 (D68) — the worst of them.** One question with an unknown type, or a `null` entry, in the saved draft
    blanked the Questions step on every visit, permanently, with nothing in the UI to clear it. The draft had no
    schema and its questions were never checked. Now validated as deeply as a saved game, and an unusable draft is
    set aside under `zakovat.draft.unreadable` (this adds one storage key — the owner can veto it).
  - **F23 (D69).** After reopening an earlier pocket and reloading, the wheel rested on the last pocket played, so
    the pointer named one pocket while the card and the highlight named another. Now `restingPocket(game)`.
  - **F24 (D70).** `typeOf` in the paste parser lowercased with the device's locale, so on a Turkish or Azerbaijani
    machine an upper-case "DIREKTOR" lost its type entirely (and then hit F22). Now plain `toLowerCase`.
- **Verified in the browser** (headless Chrome over the DevTools protocol, real clicks and keys, 1366×768):
  - F22 before: three visits, blank each time, bad draft still in storage, React throwing "Element type is invalid".
    After: the step opens, the draft is under the backup key, and the teacher adds the sample set, starts the game
    and plays a question — clicked through end to end.
  - F23 before: `current: 1`, `played: [1,2,3]`, pointer on pocket 3. After: pointer and highlight both on 1,
    before and after closing the card.
  - F19, F20, F21, F18, F14 and F17 suites all re-run green after these changes.
- **Only tested, not clicked:** F24 — the host locale here is ru-RU, so the Turkish case rule cannot be reproduced
  in this browser. It is pinned by a test that stubs `toLocaleLowerCase`, and the mechanism is shown in the test
  itself. Also only tested: the randomised sweeps, and the deeper draft and loader rejections.
- **F5 and F7 closed out as far as the agent can take them** — both now ⏸ for the owner.
  F5: the sandiqcha reference image is genuinely absent and in no commit; the recommendation is to close it as not
  needed, since D11 already rules its content out. F7: a second attempt failed for a structural reason — Telegram's
  public web preview never serves file attachments, and `telemetr.io` returns 403. The row says exactly what to open
  in the Telegram app.
- **Checks:** `npm run check` passes: 175 keys, 111 tests, lint, build.
- **Next:** nothing substantial is left on the agent's side. Preview 1 (F4), M6 (F2), M7 (F3) and the Codex review
  (F8) all wait on the owner.

### 2026-11-11 (after M5) — the fix round: F19, F21, F18, F20, F14

Five open items that needed no account and no owner action. **Nothing was pushed, deployed or reviewed with Codex.**

- **F19 — card shortcuts bypassed the control locks** (D62, D63). The key rule moved out of `QuestionCard` into
  `src/play/cardKeys.js` (`cardKeyAction`): pure, so the locks have their own tests. Any open `<dialog>` now makes the
  card — and the wheel's Space — ignore every key, and after zero Space does nothing (it is still swallowed so it
  cannot scroll). The keys line at the foot of the card drops the Space half at zero (`card.keysDone`).
- **F21 — structurally broken saves passed the loader** (D64). `loadGame` puts the saved teams, questions and
  settings back through `createGame`, then checks what `createGame` cannot see, then checks the stored settings for
  themselves — a game saved with `points: null` passed the boundary, because `createGame` fills missing values from
  the defaults. The `localStorage` getter is now inside a try.
- **F18 — invalid settings bypassed setup validation** (D65). `createGame` requires whole numbers in range for time,
  bonus and all six points fields; the Questions step maps the new `points` error to the settings error it already
  shows. The wizard step link stays open by design: the refusal belongs at Start.
- **F20 — two confirmations shared the heading id `confirm-title`** (D67). It comes from `useId` now.
- **F14 — very long questions are flagged** (D66). `isLongQuestion` (over 250 characters) marks a question in the
  list with its length and "may need scrolling on a small screen". The card itself is unchanged (D51).
- **Decided:** D62–D67. **Draft text touched (F10):** `questions.startError.settings` now says time *and* points;
  new `card.keysDone`, `questions.long`.

**Verified in the browser** — headless Chrome over the DevTools protocol, with real mouse clicks, real key events
and screenshots at 1920×1080, 1366×768 and 1280×720 (the scratch driver lives outside the repo, in
`%TEMP%\zakovat-check\`; it was needed because the browser pane could not connect this session):

- F19, 1366×768: spun the wheel by clicking the hub, started the clock with Space, handed in with "2". Opened
  End game from the top bar and pressed Escape — only the dialog closed; the card stayed open, its timer kept
  running and the game did not end. At 0:00 Pause was gone, Space left the timer untouched, and "3" nineteen
  seconds in was stamped "0:19 · kech". The card at zero with 8 teams fits all three sizes with no scrolling.
- F21: `current: 99`, a missing round, a null timer, `points: null` and a missing `timeSec` each landed on a clean
  main page with the raw data under `zakovat.game.unreadable`; a running game resumed on its own pocket (clock
  0:07); a finished game still opened its leaderboard. No uncaught exceptions in the whole run.
- F18: typed -1 into Ordinary · correct, saw the range error and Next locked, used the step link to Questions,
  added the sample set, and Start was refused with "Sozlamalardagi vaqt va ballarni tekshiring." linking back to
  `/new`, with nothing saved. Put the value back to 2 and the same Start opened the game.
- F20: with a card open, the two mounted dialogs have different ids and each is announced as its own title
  (End game, Reset, Clear list, Replace game).
- F14: a 360-character question is flagged, a short one beside it is not; the line fits at all three sizes with no
  horizontal scroll, in Uzbek and Russian.
- F17 (already fixed) re-checked: with 30 in the list a typed question is refused and both fields keep their text.

- **Checks:** `npm run check` passes: 175 keys, 104 tests, lint, build. New tests: `src/play/cardKeys.test.js`
  (F19), 25 corruptions and a full-flight round trip in `storage.test.js` (F21), engine range tests in
  `game.test.js` (F18), the 250-character boundary in `draft.test.js` (F14).
- **Not verified:** the Codex review (F8); the interface text (F10); the printed breakdown (F16); anything needing
  a projector, a classroom or an account.
- **Note for the next session:** port 5180 was taken by another project on this machine, so the dev server ran on
  **5181** (`npm run dev -- --port 5181`). `vite.config.js` still says 5180 with `strictPort`.
- **Next:** everything else is still blocked on the owner: Preview 1 (F4), M6 (F2), M7 (F3), reviews (F8).
  Remaining agent-side items are small: F5 and F7, both low priority.

### 2026-11-11 (night, later) — M5: end of game

- **Built (`src/play/`):**
  - `ResultsPage` (`/game/results`): the leaderboard with shared places, counts and scores; compact rows above five teams.
  - `BreakdownPage` (`/game/breakdown`): the graded sheet; `VerdictDialog` for corrections; print styles (A4 landscape).
  - `verdictIcons.js`, shared by the card and the breakdown. `styles/stage.css`: the stage buttons, now shared.
  - End game opens the leaderboard; the main page shows "Oxirgi o'yin" for a finished game.
- **Decided:** D57–D60.
- **Verified: the full flow script (plan §7.4), from an empty browser at 1366×768.**
  - Real clicks and typing: setup with 3 teams, 10 s, extra 4 s; pasting the 10 sample questions by typing; Start.
  - Each round: spin with Space; Start with Space; hand-ins with number keys. Reveal and verdicts used scripted DOM
    clicks on the real buttons.
  - Round 1: team 3's hand-in undone with a second "3"; ✓✓ suggested for teams 1 and 2.
  - Round 2: a reload mid-timer resumed (0:08 → 0:07), with the card and hand-in kept.
  - Round 3: scores hidden and shown again with real clicks on "Ballar", card totals included.
  - Every verdict type used. All 10 played: hub "Savollar tugadi"; ranking 22 / 22 / 17.
  - End game with real clicks: the leaderboard shows places 1, 1, 3.
  - Breakdown, with real clicks: Burgutlar's mark on question 6 changed from ✕ to ✓ in the dialog; total 17 → 20;
    the leaderboard agrees.
  - Main page with real clicks: "Oxirgi o'yin … g'olib: Bilimdonlar, Yulduzlar".
  - Layout: the leaderboard with 8 teams fits one screen at 1280×720 and 1920×1080; the breakdown with 8 team
    columns has no horizontal scroll at 1280 or 1920.
  - Fixed on the way: a seam in leaderboard rows (`display: grid` on a table cell); 8 teams overflowing 720 px;
    the compact sizes enlarging the column headers.
- **Checks:** `npm run check` passes: 173 keys, 92 tests, lint, build.
- **Not verified:** the printed breakdown (F16); the Codex review (F8); the interface text (F10).
- **Next:** everything after M5 needs the owner's accounts: Preview 1 (F4: GitHub and Vercel), M6 (F2: Firebase),
  M7 (F3: API key). Without them the agent can do F14 (flag long questions).

### 2026-11-11 (late night) — M4: the question card

- **Built (`src/play/`):**
  - `QuestionCard`: type band with the way back; `Timer`; the question fitted to its space (`useFitText`); the answer
    and its reveal; team rows (`TeamRow`); a keys line.
  - `Timer`: clock icon, digits, an elapsed bar with the extra window marked, a phase line, Start / Pause / Resume / Reset.
  - `tone.js`: two Web Audio beeps at zero. `useNow`: ticks while the clock runs.
  - The card now covers the stage only; the top bar stays usable.
- **Decided:** D50–D56.
- **Verified in the browser (real clicks and keys):**
  - 2-team round at 1920×1080 (30 s, extra 10 s): phases green → navy → red, each with its phase line.
    Key "2" at 3 s showed "0:03 · qo'shimcha"; key "1" at 17 s showed "0:17". At zero: "Vaqt tugadi", only Reset left.
    Reveal: "Javob: Kolibri"; verdicts unlocked; ✓✓ suggested only for the extra-window team. Verdicts gave +3 and +2;
    changing a verdict to ✕ took the total back to 0.
  - 8-team round at 1366×768 (14 s): Space started the timer and key "3" recorded a hand-in. A **reload mid-timer**
    resumed (0:12 → 0:10 a second and a half later; card open; hand-in kept). The tone fired once at zero after the
    reload (two oscillators counted). Late hand-ins read "kech"; a second "6" removed team 6's hand-in. Reveal showed
    "Qutida: Taroq"; sandiqcha points 3 and 4.
  - The longest sample question (124 characters) fits at every size with 8 teams: 46 px at 1366, 45.6 at 1280,
    71 (the maximum) at 1920. The card stays inside the screen.
  - Scores hidden from the top bar while the card is open: totals disappear, then come back.
  - Russian interface: labels and keys line; the question keeps its set's language.
  - Fixed on the way: Pause still showing at 0:00; "+0" for wrong verdicts; team names cut by long status text at
    1280; a 372-character question clipped at top and bottom (it now scrolls, F14); sound after a reload
    (any tap or key now unlocks it).
- **Checks:** `npm run check` passes: 148 keys, 92 tests, lint, build.
- **Not verified:** the Codex review (F8); tone volume in a classroom (F15); the interface text (F10).
- **Next:** M5: End game opens the leaderboard (shared places), the breakdown with corrections, and the way back to
  the main page; the full flow script (plan §7.4).
