# Handoff

> Read this first, every session. Stable sections on top; the Session Log below keeps the **newest five entries**.
> When you add a sixth, move the oldest to `docs/archive/handoff-YYYY-MM.md`, unedited.

---

## 1. Where it stands

- **M0–M4 are done and committed; M5 (end of game: leaderboard, breakdown) is next.** The plan is approved (D27).
- Decisions: `docs/decisionlog.md` D1–D56. Older Session Log entries: `docs/archive/handoff-2026-11.md`.
- The owner will do the account and tool to-dos later (2026-11-11: "I will do everything manual later"):
  - F8: update Codex. Milestones are committed unreviewed until then, and reviewed afterwards.
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
| `paste.js` | `parsePaste` → `{ questions, errors }`, `formatPaste`, `normalizeUz` |
| `storage.js` | `saveGame` / `loadGame` / `clearGame` in `localStorage`; unreadable data set aside |
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
- Milestone review: `codex review --uncommitted` before the milestone commit (D1). It does not accept custom
  instructions together with `--uncommitted` (CLI 0.142.0); it reads `AGENTS.md` → `CLAUDE.md` instead.

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

### 2026-11-11 (late) — M3: the wheel

- **Built (`src/play/`):**
  - `GamePage` (`/game`): top bar with progress, scores and sound switches, language, End game with a confirmation.
  - `Wheel`: an SVG with a rim, pockets, bowl and hub; pocket numbers and type icons; played pockets grey and
    reopenable; the pointer.
  - `wheelGeometry.js`: tested; it includes the one-question ring.
  - `Legend` with how many of each type are left; `RankingPanel` with shared places, hidden with the scores.
  - A first `QuestionCard`: type band, number, question, back to the wheel.
  - `useGame`: the game in state, saved after every action, with `now` stamped on each action.
  - Setup's Start and the main page's Continue now open `/game`.
- **Decided:** D44–D49.
- **Verified in the browser:**
  - A real spin: the hub reads "Aylanmoqda" and is locked; it lands on the pocket the engine chose (pocket under
    the pointer = the opened card, checked by rotation maths); the card opens with focus.
  - Escape closes the card, and the pocket turns grey. Space spins. A reload with a card open reopens the same card,
    with the wheel resting on its pocket.
  - Scores hide and show. Clicking a grey pocket reopens it.
  - All played: "Savollar tugadi" (disabled), End game turns primary, and the hint says so.
  - End game: confirmation with focus on Cancel; the game ends; the main page shows no Continue.
  - Screenshots of 10, 20 and 30 pockets at 1920×1080, 1366×768 and 1280×720; uz and ru; 3 to 8 teams. No scrolling at any size.
  - A one-question wheel draws a full ring.
  - Fixed on the way: a bowl too large for the pocket ring; the pointer covering pocket numbers; icons too close to numbers.
- **Checks:** `npm run check` passes: 119 keys, 92 tests, lint, build.
- **Not verified:** the Codex review (F8); 30-pocket numbers from the back of a real classroom (F13); the interface text (F10).
- **Next:** M4, the full card: timer in three colours and the tone, reveal, hand-ins, verdicts with the extra suggestion, live scores.

### 2026-11-11 (night) — M2: main page, setup, questions

- **Built:**
  - Main page: tagline, "Yangi o'yin", and a "Continue" block for an unfinished game.
  - Setup `/new`: teams 2–8 with names, time, extra window, scores and sound switches, points (collapsed).
  - Questions `/new/questions`: set language; three ways to add (paste, one by one, sample set); the list with
    counts per type, boxes to prepare, edit, delete and clear; Start, with a replace-game confirmation.
  - The draft lives in `localStorage` (`zakovat.draft`; `src/setup/draft.js`).
  - Shared pieces: `ConfirmDialog` (`<dialog>`), `NumberField`, `TypeChip` / `TypePicker` / `TypeIcon`, `WizardSteps`,
    and `styles/forms.css`.
- **Decided:** D38–D43.
- **Verified in the browser (real clicks and typing):**
  - Setup: the duplicate-name error on both fields; the extra-window error with the limit in the text; Next locked
    until both are fixed; names and settings survive a reload.
  - Uzbek paste: an error block was reported by line and nothing was added; after the fix, 3 questions were added,
    numbering stripped, the type read from its own line, `‘` converted to `'`.
  - Manual entry: the box-object label for sandiqcha; the "write both" error; the type kept after adding.
  - Edit and delete. Start: a uz game was saved with the default "3-jamoa" and 45/15 s, and the main page shows it.
  - Russian run: the set language switched; the clear-list dialog (focus on Cancel); a Russian paste with
    "Чёрный ящик" / "Ответ"; the replace-game dialog; a ru game saved.
  - The 30-question limit refuses a set that does not fit and names how many still fit.
  - Layout at 1920×1080, 1366×768 and 1280×720: no horizontal scroll, nothing outside the column; screenshots in uz and ru.
  - Fixed on the way: the native fieldset border; misaligned time fields; a weak selected state in the segmented control.
- **Checks:** `npm run check` passes: 99 keys, 86 tests, lint, build.
- **Not verified:** the Codex review (F8); the interface text (F10). "Continue" opens the not-found page until M3 (F11).
- **Next:** M3, the wheel: 10–30 pockets, spin, used pockets grey, legend, ranking panel.

### 2026-11-11 (evening) — M1: game engine

- **Built:** `src/game/`, as mapped in §1b: rules, timer, scoring and ranking, paste import and export, storage with
  resume, and sample sets (10 per language). No UI.
- **Decided:** D31–D37. They cover the extra suggestion, hand-in and reset rules, the clock after zero, reopening a pocket,
  team names, paste format details, and unreadable saves.
- **Verified:**
  - `npm run check` passes: 77 tests in 7 files, lint, i18n, build.
  - Mutation check: three rules were broken on purpose and each was caught by its own test, then restored and
    re-run green. The three were the extra boundary (≤ → <), shared places (1, 1, 3 → 1, 1, 2) and the verdict lock before the reveal.
  - Both sample sets survive a round trip through `formatPaste` → `parsePaste` and start a game.
- **Not verified:** the Codex review (F8). The sample-set wording is a draft until the owner approves it (F9).
- **Next:** M2, the main page, setup and the questions step (paste, type, sample set) in uz and ru.

### 2026-11-11 (later) — M0: foundations

- **Built:**
  - a Vite + React app;
  - tokens (`src/styles/tokens.css`): PDP colours, Onest, the UI and stage type scales, space, shape and motion;
  - i18n: `uz.js`, `ru.js`, `translate.js`, `I18nProvider`, and `scripts/check-i18n.mjs`;
  - ESLint and Vitest;
  - a header with the language switch, a stub main page, a not-found page, and the dev token sheet `/dev/tokens`.
- **Decided:** D28 (Onest bundled), D29 (dev token sheet), D30 (React Router 7 and Vitest 5: the audit found
  advisories in 6 and 3; the audit is now 0). Direktor amber darkened to `#9a5f00` (white on it 5.2:1; plan §5 updated).
- **Verified:**
  - `npm run check` passes (9 keys, lint clean, 5 tests, build).
  - The token sheet is absent from the production bundle (grep).
  - Loaded in the browser at 1920×1080, 1366×768 and 1280×720: the main page in uz and ru, and the token sheet.
  - Measured at 1920×1080: question text 40–71 px, team names 28 px, timer 119 px, root font 18.9 px.
  - Measured at 1280×720: question floor 26.6 px (3.69% of the height, the same share as at 1080); no horizontal scroll.
  - Onest's Latin and Cyrillic faces are loaded.
  - Tabular figures: proportional `1111`/`0000` measure 93/170 px; with `tabular-nums`, 172/172.
  - The language switch updates `<html lang>` and is remembered in `localStorage`.
- **Not verified:** the Codex review. CLI 0.142.0 is too old for the account's model (F8); the review runs after the owner updates Codex.
  The logo is not in place yet (F1).
- **Next:** M1, the game engine, plus the sample question sets (uz and ru) as a draft for the owner.

