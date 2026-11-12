# Plan — Zakovat platform for PDP School

> Status: **APPROVED by the owner, 2026-11-11** ("Approve, start M0"; D27). Changes to scope, milestones or tests need the owner's OK.
> Read this before you change scope, milestones or the test plan. Decisions it rests on: `docs/decisionlog.md` (D1–D26).

---

## 1. Flow

Main page → Setup → Questions → Wheel ⇄ Question card → End game → Leaderboard → Breakdown → Main page.

The Questions step is new (D18). "Continue game" on the main page reopens an unfinished game after a reload or a closed tab (D15, §3).

## 2. Architecture

| Part | Choice | Why |
|---|---|---|
| App | React 18 + Vite 6, React Router 7 (D30), plain CSS with tokens | Same stack as Axeno; no CSS framework to learn or fight |
| Icons | `lucide-react` (monochrome SVG) | Same set as Axeno; tree-shaken |
| Game logic | Pure JS in `src/game/` (a reducer plus helpers), no React inside | Testable without a browser; the UI only renders state |
| Game state | `localStorage`, saved after every action, versioned schema | A reload loses nothing; works with no network once loaded |
| UI text | `src/i18n/uz.js`, `ru.js`, a `t()` hook; a script checks that both have every key | The language switch can't show a missing string |
| Accounts (M6) | Firebase Auth (Google) + Firestore, loaded lazily | The game screens never wait for Firebase |
| AI (M7) | One Vercel JS function `api/generate.js` → OpenAI API | The key stays on the server; the provider sits in one file (D20) |
| Hosting | Vercel: static app + one function | — |

Not used: Python (D20), a PWA/offline cache (the game needs the network only to load; revisit if classroom Wi-Fi proves bad, F6).

## 3. Data model

```js
Question    { id, type: 'oddiy' | 'direktor' | 'sandiqcha', text, answer }   // sandiqcha: answer = the object (D11)
QuestionSet { id, title, lang: 'uz' | 'ru', questions: Question[], createdAt, updatedAt }

Game {
  schema: 1, id, lang, createdAt, endedAt | null,
  settings: {
    timeSec: 60, extraSec: 20, warnSec: 10, showScores: true, sound: true,
    points: { oddiy: {correct: 2, extra: 1}, sandiqcha: {correct: 3, extra: 1}, direktor: {correct: 4, extra: 1} }
  },
  teams:   [{ id, name }],                       // 2–8 (D17)
  pockets: [{ no, question }],                   // numbered once, at start, in random order
  rounds:  { [pocketNo]: {
              timer:    { startedAt | null, accumulatedMs },   // elapsed = accumulated + (now − startedAt)
              revealed: false,
              handIns:  { [teamId]: elapsedMs },               // D6
              verdicts: { [teamId]: 'wrong' | 'correct' | 'extra' } } },
  played: [pocketNo], current: pocketNo | null
}
```

- **Scores are never stored.** `score(team)` sums `points[type][verdict]` over all rounds (D15).
- **Extra pre-selection:** a hand-in at `elapsedMs ≤ extraSec × 1000` pre-selects "extra" once the answer is revealed (D7).
- **The timer survives a reload:** it is stored as timestamps, not as a counting number.
- **Firestore (M6):** `teachers/{uid}/sets/{setId}`, `teachers/{uid}/games/{gameId}`, `teachers/{uid}/usage/{date}`.
  Rules: owner only. Maps keyed by id, so no nested arrays (Axeno Engineering-Lessons §14).

## 4. Screens

| # | Screen | What it holds |
|---|---|---|
| 1 | **Main** `/` | PDP logo top left; language switch and sign-in top right. Title, one line on what the game is, **one primary button: "Yangi o'yin"**. If a game is unfinished: a "Continue" block with its progress (question 4 of 10, teams). Signed in: the last three finished games (date, winner). |
| 2 | **Setup** `/new` | Teams (2–8, names prefilled "1-jamoa"…), time per question, extra window, scores shown / hidden, sound. Points: collapsed, editable (D9). |
| 3 | **Questions** `/new/questions` | Source: saved sets (signed in) · paste · type · generate (signed in) · sample set. The list: type, text, answer; edit, delete. Counts per type. For sandiqcha questions: "Boxes to prepare: comb, matches". Set language. "Start game". |
| 4 | **Wheel** `/game` | The wheel (D23) with a legend (icon, name, how many are left). Ranking panel on the right when scores are shown. Top bar: "Question 4 / 10", scores switch, sound switch, "End game" (asks to confirm). Spin: the button under the wheel, the hub, or the Space key. |
| 5 | **Question card** (over the wheel) | Type band (colour, icon, name) and pocket number. Timer at the top (clock icon, mm:ss, three colours, start / pause / reset). Question text, size fitted to length (D25). "Show answer". Team rows: name, hand-in tap with its time, three icon verdict buttons (locked until the answer is revealed, D8), points for this question and in total. |
| 6 | **Leaderboard** `/game/results` | Places with ties (D16), scores, counts of correct and extra. "Show breakdown", "Main page". |
| 7 | **Breakdown** `/game/breakdown` | One row per question in the order played: number, type, question, answer, each team's mark. Click a mark to correct it (D15). Totals row. Prints cleanly. |

**Changed 2026-11-12 (owner's design round):** the main page (D76), the wheel's result dialog and played pockets
leaving the wheel (D73, replaces D23), the game screen's side panels (D74), the results podium (D75), the setup
summary (D77) and the breakdown's layout (D79). The table above is the original plan; the decisions win.

Sign-in is a Google popup from the header, not a page. Saved sets are managed inside the Questions step.

## 5. Design direction

- **Light theme only.** Dark text on a light background holds its contrast on projectors in lit classrooms. One theme also means one theme to check.
- **Font: Onest** (PDP School's own; Latin, Cyrillic, variable weight) for everything. Weights 400–600, titles bigger rather than bolder (the Axeno rule). Figures for the timer and scores must be tabular (checked in M0).
- **Colours.** Every colour comes from PDP School's palette, darkened where white text or a white card needs contrast. Measured 2026-11-11:

  | Role | Colour | Contrast |
  |---|---|---|
  | Text, neutral timer | navy `#0b1a66` | 15.5 : 1 on white |
  | Primary action, Oddiy savol | blue `#2040ff` | white on it 6.5 : 1 |
  | Direktor savoli | amber `#9a5f00` (from brand `#fee2a8`; was `#b06d00` at 4.2 : 1, darkened in M0) | white on it 5.2 : 1 |
  | Zakovat sandiqchasi | violet `#8a3fc7` (from brand `#c586e9`) | white on it 5.8 : 1 |
  | Timer: extra window | green `#0f7f4a` (from brand `#3ee08f`) | 5.1 : 1 on white |
  | Timer: little time left | red-pink `#d6004f` (from brand `#ff0165`) | 5.3 : 1 on white |

  Colour-blind check (simulated): the closest pair is blue and violet under protanopia (ΔE 26.8): visible, but every type also carries its icon and name (D24). Two other palettes were rejected. Blue / pink / amber: pink and amber merge under deuteranopia, and pink would clash with the timer warning. Blue / amber / navy: navy is already the neutral colour.
- **Readable from the back row.** At 1920×1080 the question text is never smaller than 40 px and team names 28 px. The timer digits fill the timer block. On screenshots, the check is to read the screen shrunk to a quarter.
- **Motion:** one wheel spin of about 4 s and a 200 ms card transition. Nothing else moves. With reduced motion, the spin is short.
- **Logo:** the official webp at its native size on the main page (D26). The wheel hub shows PDP's round mark, using its official SVG (not redrawn).
- **Known risk:** 8 team rows on a 1366×768 laptop leave little room for the question. M4 decides from screenshots whether rows go into two columns above 4 teams.

## 6. Milestones

Every milestone ends with: build passes → checked in the browser → `codex review` → its findings sorted into `fixlist.md` →
a commit → a `handoff.md` entry stating what is done, what is verified, and what is next.

| M | What | Done means |
|---|---|---|
| **M0** | Foundations: Vite app, tokens (colours, Onest, type scale, spacing), i18n skeleton with key check, ESLint, Vitest (`CLAUDE.md` and `AGENTS.md` already exist, 2026-11-11) | Build passes; the empty shell renders at the three sizes; tabular figures confirmed |
| **M1** | Game engine: reducer, scoring, ties, timer, hand-ins and extra pre-selection, paste parser (apostrophes normalised), storage with resume. **Sample set**: 10 questions per language (7 Oddiy, 1 Direktor, 2 Sandiqcha), a draft for the owner to approve | Unit tests pass; no UI yet |
| **M2** | Main, Setup, Questions (paste, type, sample set) in uz and ru | A game is created from a paste in both languages; screenshots at three sizes |
| **M3** | Wheel: 10–30 pockets, spin lands on a random unused pocket, used pockets grey, legend, ranking panel | Screenshots at 10, 20, 30 pockets × three sizes |
| **M4** | Question card: timer in three states plus the tone, reveal, hand-ins, locked and pre-selected verdicts, live and hidden scores | A full round with 2 and with 8 teams; the longest sample question fits; a reload mid-timer resumes |
| **M5** | End of game: End game, leaderboard with ties, breakdown with corrections, Continue game | The full flow script (§7.4) passes in the browser |
| → | **Preview 1** (needs F4): the core game, no sign-in. The owner tries it in a classroom (F6) | The owner's list in `fixlist.md` |
| **M6** | Accounts (needs F2): Google sign-in, saved sets, finished games, history on the main page, owner-only rules | A set saved in one browser loads in another; a second account cannot read it |
| **M7** | AI (needs F3): `api/generate.js`, token check, daily limit, structured output, review step; for a sandiqcha, the object as input. **Proposed 2026-11-12 (F29, waiting on the owner):** a shared question bank filled before the API is called, a school-wide monthly cap, and end-of-cycle Batch generation | uz and ru sets generated on the preview; the limit holds; the key is not in the client bundle |
| → | **Preview 2**, then **Production** on the owner's OK | — |

**Commits:** the agent commits locally at the end of each milestone. Nothing is pushed until F4 is settled, and nothing goes to Production without the owner's OK.

## 7. Test plan

1. **Unit (Vitest, from M1):**
   - points per type and verdict;
   - the extra boundary (exactly 20.0 s counts as extra; 20.001 s does not);
   - ties (1, 1, 3);
   - timer: pause, resume, reload;
   - verdict toggles and later corrections;
   - paste parser: uz and ru type names, blank lines, mixed apostrophes, errors reported with line numbers;
   - resume from storage, and a stored game with an older schema.
2. **Static (every milestone):**
   - `npm run build`;
   - ESLint;
   - `check-i18n`: uz and ru have the same keys, no empty strings, ASCII apostrophes in uz.
3. **Visual (browser pane, every UI milestone):**
   - sizes: 1920×1080 (projector), 1366×768 (laptop), 1280×720 (low-resolution projector);
   - wheel with 10, 20 and 30 pockets;
   - card with 2 and 8 teams, the shortest and the longest question, in uz and ru;
   - the timer in each of its three states;
   - the back-row test (the screenshot shrunk to a quarter).
   - Lint and scripts do not count as a visual check.
4. **Flow script (real clicks, M5 and every later milestone):**
   - set up 3 teams;
   - paste the sample set and spin through all 10 questions;
   - use every verdict type at least once;
   - undo a hand-in;
   - reload while the timer runs;
   - hide and then show the scores;
   - finish with a tie;
   - correct one verdict from the breakdown;
   - go back to the main page.
5. **Accounts and AI (on the preview):**
   - sign-in;
   - a second account cannot read the first account's data;
   - the daily limit holds;
   - the key is not in `dist/` (grep).
6. **Codex review** at the end of every milestone (D1).
7. **What the agent cannot verify** (left 🟡 for the owner): a real projector at real distance, touch boards, sound volume, and Google sign-in on school devices.

## 8. Docs

`CLAUDE.md` holds the rules for every session; `AGENTS.md` is one line pointing to it, for Codex. The `docs/` files are:
- `handoff.md`: a session log of the newest five entries;
- `decisionlog.md`;
- `fixlist.md`: open items, including the owner's checks;
- `plan.md`: this file.

There is no separate QA file. The flow script (§7.4) and the owner's checks live in `fixlist.md`.
