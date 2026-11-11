# Handoff

> Read this first, every session. Stable sections on top; the Session Log below keeps the **newest five entries**.
> When you add a sixth, move the oldest to `docs/archive/handoff-YYYY-MM.md`, unedited.

---

## 1. Where it stands

- **M0 (foundations) is done and committed; M1 (game engine) is next.** The plan is approved (D27).
- Decisions: `docs/decisionlog.md` D1–D30.
- Owner to-dos: F8 (update Codex so milestone reviews run), F1 (OK to download the interim logo files),
  F2 (Firebase project, by M6), F3 (API credits and key, by M7), F4 (GitHub repo and Vercel project, by Preview 1).

## 2. Stack and commands

- React 18.3 + Vite 6.4, React Router 7 (D30), plain CSS with tokens (`src/styles/tokens.css`), lucide-react,
  Onest bundled via `@fontsource-variable/onest` (D28). Tests: Vitest 5. Node 22.x.
  Later: Firebase Auth + Firestore (M6), one Vercel JS function for AI (M7).
- `npm run dev`: dev server on **http://localhost:5180** (`.claude/launch.json` → `zakovat-dev` for the browser pane).
- `npm run check`: i18n check, lint, tests, build (all four; run it before every commit).
- `npm run check:i18n`: uz and ru have the same keys, no empty values, ASCII apostrophes in uz, no unknown `t("key")`.
- `/dev/tokens` (dev server only, D29): every token on one screen; the fixture for screenshots at the three sizes.
- Visual check sizes: 1920×1080, 1366×768, 1280×720, set with the browser pane's `resize_window`.
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
