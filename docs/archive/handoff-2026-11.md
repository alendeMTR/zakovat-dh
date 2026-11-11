# Handoff archive — November 2026

> Session Log entries moved out of `docs/handoff.md` (newest five stay there). Newest first, unedited.

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

### 2026-11-11 — Research, phase-2 questions answered, plan drafted

- **Changed:** created the project's own git repo (`main`, D3); wrote `CLAUDE.md`, `AGENTS.md`, and `docs/`
  `decisionlog.md`, `fixlist.md`, `plan.md` and this file. Nothing committed.
- **Decided:** D1–D26. The owner approved every phase-2 recommendation. Additions from the owner: points shown as
  editable defaults, collapsed (D9); paper slips with a tap when each slip arrives (D6); the sandiqcha answer is the object,
  and AI writes the question from it (D11).
- **Verified:** the palette contrast and colour-blind separation, by script (numbers in `plan.md` §5).
  Codex CLI 0.142.0 is installed and has `codex review`.
- **Not verified:** everything in the plan; nothing is built.
- **Next:** the owner approves or changes `docs/plan.md`; then M0.
