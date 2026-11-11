# Owner guide: what to test, what not to flag, what to do by hand

> Written 2026-11-11, after M5 (commit `bb393c9`). For the owner, and for any agent (Claude or Codex) that
> continues the work. Status and history: `docs/handoff.md`. Open items: `docs/fixlist.md` (F-numbers below).

## 1. Where it stands

- M0–M5 are built and committed. The whole game works in the browser **with no accounts and no internet after
  loading**: main page → setup → questions → wheel → question card → leaderboard → breakdown → main page.
- Not deployed anywhere yet. To run it on your laptop, in the project folder:

```bash
npm install
```

```bash
npm run dev
```

  Then open http://localhost:5180. Fastest test set: Questions step → "Namuna to'plam" tab.

## 2. What to test

Report each problem as: what you did, what you expected, what happened, and the screen size or device.

### A. Only you can test these (real classroom)

| # | Test | Where it is tracked |
|---|---|---|
| 1 | Projector: resolution, touch board, speakers; the whole game projected | F6 |
| 2 | Question text readable from the back row (floor 40 px at 1080p) | plan §5 |
| 3 | Wheel with 30 questions: pocket numbers readable from the back row | F13 |
| 4 | The zero tone (two beeps) loud enough on classroom speakers | F15 |
| 5 | "Chop etish" on the breakdown: A4 landscape, colours kept, no buttons | F16 |

### B. The full flow on your laptop

1. Main page → "Yangi o'yin" → setup: 2–8 teams, names (try two equal names), time, extra window (try one longer
   than the time), scores and sound switches, points (open "Ballar").
2. Questions: paste text with one mistake first (a question without "Javob:"), then fixed; add one question by hand
   (try a Zakovat sandiqchasi); add the sample set; edit, delete, clear the list; try to go past 30 questions.
3. Start → wheel: spin with the hub and with Space; played pockets turn grey; click a grey pocket to reopen it;
   "Ballar" and "Ovoz" switches; UZ / RU.
4. Question card: Start, Pause, Reset; a tap on a team row or keys 1–8 when a slip arrives (a second tap undoes it);
   "Javobni ko'rsatish"; the verdicts ✓✓ / ✓ / ✕ (✓✓ is outlined as a suggestion for teams inside the extra window);
   reload the page while the timer runs; Escape back to the wheel.
5. "O'yinni yakunlash" → leaderboard (make a tie on purpose) → "Savollar tahlili" → correct one mark → back to the
   leaderboard → "Bosh sahifa" ("Oxirgi o'yin" shows the winners).

### C. Text to read and approve

| # | What | File |
|---|---|---|
| F10 | All interface text, Uzbek and Russian (drafts) | `src/i18n/uz.js`, `src/i18n/ru.js` |
| F9 | The two sample sets (drafts), and the Russian names of the three types | `src/game/sampleSets.js` |

## 3. Do not flag these yet: known, planned, or placeholders

| What you will see | Why | Comes with |
|---|---|---|
| "PDP School" as plain text in the header; no logo, no tab icon | Logo files wait for your OK to download (or the SVG from PDP) | F1, D26 |
| No sign-in, no saved question sets, no game history beyond the last game | Accounts are milestone M6 | M6 (needs F2) |
| No "AI" tab in the questions step | AI generation is milestone M7 | M7 (needs F3) |
| Russian type names "Обычный вопрос / Вопрос директора / Чёрный ящик" (paste labels "Обычный / Директор / Ящик") | Placeholders; the Russian names are your choice | F9, D42 |
| Wording of any interface text or sample question | All drafts | F10, F9 |
| Starting a new game replaces the last finished one | One game is kept until accounts exist | D41, D60, M6 |
| A very long question (over about 250 characters) scrolls on a small screen with 8 teams | Known; a warning in the questions list is planned | F14 |
| An Uzbek question set stays Uzbek when the interface is switched to Russian | By design: the switch changes the interface only | D21 |
| A presentation clicker (Page Down) does not spin the wheel | Not mapped on purpose, to avoid accidental spins | D47 |
| `/dev/tokens` page | Developer tool, only in `npm run dev`; not in builds | D29 |
| No Codex review of M0–M5 yet | Waiting for the Codex update | F8 |
| Phone layout | Not a target: laptop and projector only | brief |
| Not online anywhere | Waiting for GitHub and Vercel | F4 |

## 4. Manual work, in order

### 4.1 Update Codex (F8): about 5 minutes

The installed Codex CLI (0.142.0, a standalone `codex.exe` in `AppData\Local\Programs\OpenAI\Codex\bin`) is too old for
your account's model. It updates itself. *(Corrected 2026-11-11: an earlier version of this section said to update
through the Codex app.)*

1. Open a terminal: PowerShell, or the Terminal tab in the Claude desktop app.
2. Update:

```bash
codex update
```

3. Check the version (0.167 or newer was current on 2026-11-11):

```bash
codex --version
```

4. If Codex asks you to sign in: run `codex login`, choose **Sign in with ChatGPT**, and sign in with your ChatGPT
   Pro account in the browser window that opens. Do not use an API key here: an API key bills API rates (D1).
5. If `codex update` fails, copy its error to Claude.

Then review each milestone commit, oldest first, from the project folder. Each command prints findings; paste them
to Claude or add them to `docs/fixlist.md`:

```bash
cd C:\Users\Spectre\Desktop\zakovat-progect-dh
```

```bash
codex review --commit eb3154c
```

The other commits, in order: `9b9eeea` (M1), `c33c938` (M2), `8ffc9d7` (M3), `813ea77` (M4), `bb393c9` (M5).

### 4.2 GitHub and Vercel for Preview 1 (F4): about 15 minutes

1. On GitHub, create a **private** empty repository (no README), for example `zakovat-pdp`.
2. In the project folder, connect it and push (replace `<you>`):

```bash
git remote add origin https://github.com/<you>/zakovat-pdp.git
```

```bash
git push -u origin main
```

3. On vercel.com: Add New → Project → import the repository. Vercel detects Vite: build `npm run build`, output
   `dist`. Deploy. Every push then gets a preview URL.
4. `vercel.json` (added 2026-11-11) sends every page address to the app, so a reload on `/game` works. Check this on the
   preview: open `/game/results` directly and reload.
5. Send the preview URL to Claude: the next step is checking it at three sizes, then your classroom test (section 2A).

### 4.3 Firebase for M6, accounts (F2): about 15 minutes

1. console.firebase.google.com → Add project (Google Analytics: off) → stays on the free Spark plan.
2. Build → Authentication → Get started → Sign-in method → Google → Enable.
3. Build → Firestore Database → Create database → production mode → a region near Tashkent
   (for example `europe-west3`, Frankfurt).
4. Project settings → Your apps → Web (`</>`) → register the app → copy the config values into a file `.env.local`
   in the project folder (it is git-ignored; never commit it):

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Authentication → Settings → Authorized domains → add the Vercel preview domain (from 4.2).
6. Tell Claude the file is in place. Do not paste the values into chat.

### 4.4 OpenAI API credits for M7, AI generation (F3): about 10 minutes

1. ChatGPT → Settings → Billing → API credits benefit → link it to an API organization you own.
2. platform.openai.com → API keys → create a project key.
3. Vercel → the project → Settings → Environment Variables → `OPENAI_API_KEY` = the key (Preview and Production).
   Never put it in the repo or in chat.

### 4.5 Smaller items

- **F1 logo:** ask PDP School's marketing for the logo as SVG. Until then, tell Claude "OK to download the logo files"
  (three small files from school.pdp.uz).
- **F9, F10:** read the drafts (section 2C) and send corrections.

## 5. Continuing in another session, or with Codex

- **Claude, new session:** open this folder in Claude Code and say "continue". `CLAUDE.md` makes it read
  `docs/handoff.md` first, which says where things stand and what is next.
- **Codex:** it cannot see this chat, but it can continue from the repository, which holds everything: all work is
  committed, and the docs record the state, the decisions (D1–D60) and the open items. Two things first:
  1. Update Codex (4.1); the installed version cannot run your model.
  2. **Updated 2026-11-11:** the owner updated Codex and allowed it to build (D61); `AGENTS.md` now says so, and the
     "overrides the read-only line" sentence below is no longer needed. Example prompt:

```text
You are taking over the build of this repository. For this task the owner allows you to edit files and commit
(this overrides the read-only line in AGENTS.md). First read CLAUDE.md, docs/handoff.md, docs/fixlist.md,
docs/owner-guide.md and the headings of docs/decisionlog.md. Do not re-open decided entries. Task: <the next task>.
Follow CLAUDE.md: log decisions in docs/decisionlog.md, add a docs/handoff.md entry, run `npm run check`,
check every UI change in a browser at 1920x1080, 1366x768 and 1280x720, and commit at the end.
```

- **Which tool for what:** the brief keeps design and visual review with Claude. Codex suits reviews, logic and tests
  (for example F14, or M6's Firestore rules). A UI change from Codex still needs the screenshot check at three sizes.
