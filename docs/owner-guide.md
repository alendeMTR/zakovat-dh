# Owner guide: what to test, what not to flag, what to do by hand

> Written 2026-11-11 after M5; **brought up to date 2026-11-12**, for the code you are about to push and deploy
> (everything through `9e87a90`, plus this documentation commit). For the owner, and for any agent (Claude or
> Codex) that continues the work. Status and history: `docs/handoff.md`. Open items: `docs/fixlist.md`
> (F-numbers below).

## 1. Where it stands

- M0–M5 are built and committed. The whole game works in the browser **with no accounts and no internet after
  loading**: main page → setup → questions → wheel → question card → leaderboard → breakdown → main page.
- **Two commits have landed since M5, and both are bug work only — no new screens:**
  - `4395de5` (11 Nov): five bugs found by review, fixed. Keys on the question card no longer reach through an
    open confirmation; the clock keeps running past zero so a late slip still gets its real time; a game saved in
    a broken state is set aside instead of breaking the screen; a game can no longer start with impossible
    settings such as minus points; each confirmation is announced as itself; and the questions list now warns
    about a very long question.
  - `9e87a90` (12 Nov): a stand-in code review of everything from M0 to M5, because no commit has been through
    Codex yet (F8).
    It found three more and fixed them: one unusable question in your saved list used to leave the Questions step
    blank for good; the wheel pointed at the wrong pocket after a reload; and the paste importer could lose a
    question's type on a device with Turkish or Azerbaijani language settings.
- **Eight items are now fixed and waiting for your test:** F14, F18, F19, F20, F21, F22, F23, F24. Section 2C
  below says what each one looks like on screen, in plain terms. (F17 was fixed earlier and re-checked.)
- **The review found nothing wrong with the game rules themselves.** Scoring, shared places on a tie, the timer
  across pause, reset, reload and zero, the hand-in times, and the lock that keeps verdicts hidden until you
  reveal the answer were all put through 3000 randomised play-throughs without a single wrong result.
- Checks on this commit: `npm run check` passes — 175 interface keys, 111 tests, lint, build.
- Not deployed anywhere yet; section 4.2 is now written for you to do exactly that. To run it on your laptop,
  in the project folder:

```bash
npm install
```

```bash
npm run dev
```

  Then open http://localhost:5180. Fastest test set: Questions step → "Namuna to'plam" tab.

  If it says **"Port 5180 is already in use"**, another project on this machine has it. Run it on a free port
  instead and open that address:

```bash
npm run dev -- --port 5181
```

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
3. Start → wheel: spin with the hub and with Space; a played question leaves the wheel; reopen it from the list on the left;
   "Ballar" and "Ovoz" switches; UZ / RU.
4. Question card: the clock is already running when it opens; Pause, Reset (then Start); a tap on a team row or keys 1–8 when a slip arrives (a second tap undoes it);
   "Javobni ko'rsatish"; the verdicts ✓✓ / ✓ / ✕ (✓✓ is outlined as a suggestion for teams inside the extra window);
   reload the page while the timer runs; Escape back to the wheel.
5. "O'yinni yakunlash" → leaderboard (make a tie on purpose) → "Savollar tahlili" → correct one mark → back to the
   leaderboard → "Bosh sahifa" ("Oxirgi o'yin" shows the winners).

### C. New since you last looked: eight fixes to put a finger on

None of this existed when you last opened the app. Each line says what to do and what should happen; if it does
something else, that is worth reporting.

1. **A very long question is flagged before the lesson.** In the Questions step, paste or type a question longer
   than about 250 characters. Under it the list adds a grey line with a warning triangle: "Uzun savol (NNN belgi):
   kichik ekranda matnni aylantirish kerak bo'lishi mumkin." A normal-length question beside it stays unmarked.
   The sample questions are all short, so none of them is flagged. *(F14)*
2. **A game can no longer start with impossible settings.** In Sozlamalar open "Ballar" and set the ordinary
   question's "To'g'ri" to **-1**. The field turns red and "Savollarga o'tish" is locked — but now click the
   numbered step **"2 Savollar"** at the top to get there anyway, and press "O'yinni boshlash". It refuses: a red
   line above the button reads "Sozlamalardagi vaqt va ballarni tekshiring." and is a link back to Sozlamalar.
   No game starts. Put the value back to 2 and the same button works. *(F18)*
3. **Escape inside a confirmation closes only that confirmation.** Open a question, press Space to start the
   clock, then click "O'yinni yakunlash" in the top bar and press **Escape**. The confirmation closes, the
   question card is still open behind it, and its clock is still running. The game does not end. *(F19)*
4. **The clock keeps counting after zero, and Space stops starting it.** Let a question run out. The display
   holds at 0:00 in red with "Vaqt tugadi", "Pauza" disappears and only "Qaytadan" is left, and the key line at
   the foot of the card drops its "Probel" half. Press Space: nothing happens, on purpose. Now press a team's
   number — the slip is still recorded, with its real time and the word "kech". This is the point of the fix:
   late slips must keep their true times. *(F19)*
5. **A half-broken saved game no longer breaks the screen.** You are unlikely to trigger this by hand. What
   matters is the promise: if a saved game is ever damaged (a crash mid-write, a browser clean-up), the app does
   not open a broken or blank game screen — it quietly sets the damaged copy aside and takes you to the main
   page, where you start a new game. A healthy game in progress still resumes on reload exactly as before:
   same question, same clock, same slips. *(F21)*
6. **The questions list can no longer get stuck blank.** Same promise, for the list you are preparing. If the
   saved list ever becomes unreadable, the Questions step opens **empty** rather than blank-white, and you can
   carry on at once — add the sample set, press start, play. If you ever meet a Questions step that is blank
   white, or your list disappears without you clearing it, tell me: the old copy is kept and can be recovered.
   *(F22)*
7. **The wheel points at the question you are actually on.** Spin and play two or three questions, go back to
   the wheel, then click one of the **grey** pockets to reopen it, and reload the page. The pointer at the top,
   the highlighted pocket and the card that opens should all be the same number. Before the fix the pointer sat
   on a different pocket from the card. *(F23)*
8. **Confirmations announce themselves correctly.** Nothing to see: this one only matters to a screen reader,
   which used to read "O'yin yakunlansinmi?" out as the timer-reset question. No test needed. *(F20)*

### C2. New on 12 November (evening): your design feedback, built — not committed yet

Start the dev server as before and try these in order. Each line says what to do and what you should see.

1. **Main page.** A white header with three links, a title on the left, the drawn wheel behind it on the right, and
   below: how a game runs, the three question types with their points, and the keys. With a game in progress, its
   card sits on the right of the title. *(D76)*
2. **Setup and Questions.** A "game summary" column on the right follows what you type: teams, time, questions by
   type, points, and an estimated length (each question's time plus one minute). *(D77)*
3. **Delete a question** with the bin icon: a dialog asks first and quotes the question. Cancel keeps it. *(D78)*
4. **Spin.** When the wheel stops, a box shows the question number and type. "Savolni ochish" (or Enter) opens it;
   "G'ildirakda qoldirish" (or Escape) leaves it on the wheel unplayed. Close an opened card: its pocket leaves the
   wheel and the others close up. *(D73)* **One question for you, F26:** should the box also offer "remove without
   playing", to drop a bad question mid-game?
5. **Side panels.** Left: progress, types left, and the played questions — click one to reopen it. Right: the
   ranking with gold, silver and bronze places, ✓ and ✓✓ counts, arrows for places moved and "+3" for points on the
   last question, and a short summary of that question. Switch "Ballar" off: only the team names remain. *(D74)*
6. **Score every team on an open question** while the clock runs: the clock stops and says
   "To'xtatildi: barcha jamoalar baholandi". *(D72)*
   **New, D82:** open a question: the clock is already counting, with no Start. Reopen a played one: its clock
   stays where it stopped. "Qaytadan" brings Start back.
7. **End the game.** Third place rises, then second, then first, the scores count up, then the table and three facts
   (fastest correct answer, hardest question, most extra bonuses). *(D75)*
8. **Savollar tahlili.** Team names head the columns with their place and total; the totals row is large. *(D79)*
9. **Text size** is larger on every screen. If anything now feels too large on your laptop, say which screen. *(D79)*

### D. Text to read and approve

| # | What | File |
|---|---|---|
| F10 | All interface text, Uzbek and Russian (drafts) — **262 keys as of 12 Nov (evening)** — about 90 new from the design round (C2), all draft;, three of them new or reworded this week: the long-question warning, the settings refusal at Start, and the card's key line at 0:00 | `src/i18n/uz.js`, `src/i18n/ru.js` |
| F9 | The two sample sets (drafts), and the Russian names of the three types | `src/game/sampleSets.js` |

## 3. Do not flag these yet: known, planned, or placeholders

| What you will see | Why | Comes with |
|---|---|---|
| No sign-in, no saved question sets, no game history beyond the last game | Accounts are milestone M6 | M6 (needs F2) |
| No "AI" tab in the questions step | AI generation is milestone M7 | M7 (needs F3) |
| Russian type names "Обычный вопрос / Вопрос директора / Чёрный ящик" (paste labels "Обычный / Директор / Ящик") | Placeholders; the Russian names are your choice | F9, D42 |
| Wording of any interface text or sample question | All drafts | F10, F9 |
| Starting a new game replaces the last finished one | One game is kept until accounts exist | D41, D60, M6 |
| A very long question still *scrolls* inside the card on a small screen with 8 teams | By design: the text is never cut off, and the questions list now warns you before the lesson (2C.1) | D51, F14 |
| An Uzbek question set stays Uzbek when the interface is switched to Russian | By design: the switch changes the interface only | D21 |
| A presentation clicker (Page Down) does not spin the wheel | Not mapped on purpose, to avoid accidental spins | D47 |
| `/dev/tokens` page | Developer tool, only in `npm run dev`; not in builds | D29 |
| No Codex review yet. A stand-in review by Claude covered M0–M5 on 12 Nov and found three bugs, but it does not replace the Codex one | Codex is updated and ready; the reviews just have not been run (4.1) | F8 |
| Phone layout | Not a target: laptop and projector only | brief |
| Not online until you do section 4.2 | Waiting for GitHub and Vercel | F4 |
| At 0:00 "Pauza" is gone, only "Qaytadan" is left, and Space no longer starts or stops the clock | On purpose: the clock must keep counting so a late slip gets its real time. The key line at the foot of the card drops the "Probel" half to say so | D33, D53, D63 |
| The clock reads 0:00 but a slip handed in later still shows a growing time with "kech" | Same reason: the display stops at zero, the counting does not | D33 |
| Space does nothing when a button has focus — it presses that button instead (so Space right after clicking "O'yinni yakunlash" reopens that confirmation) | By design: a focused button owns its own keys | D47, D52 |
| The step link "2 Savollar" stays clickable even when Sozlamalar has a red error | By design: moving between the two steps is useful. The refusal happens at "O'yinni boshlash", which names the setting (2C.2) | D65 |
| `zakovat.game.unreadable` or `zakovat.draft.unreadable` in the browser's storage | Damaged data kept on purpose rather than deleted, so nothing is lost silently | D37, D68 |

## 4. Manual work, in order

### 4.1 Run the Codex reviews (F8): about 10 minutes

> **Corrected 2026-11-12. Codex is already updated — this step is not about updating it any more.**
> This section used to say the installed CLI was 0.142.0 and too old for your model. It is **0.167.1**: you
> updated it on 11 Nov (D61), and the install on this machine confirms it
> (`.codex\packages\standalone\current` points at the 0.167.1 release; 0.142.0 is still there as the old one).
> What is actually left is that **nobody has run the reviews yet** — that, and nothing else, is what keeps F8 open.
> *(An earlier correction, 2026-11-11, replaced "update through the Codex app" with `codex update`.)*

1. Open a terminal: PowerShell, or the Terminal tab in the Claude desktop app.
2. Confirm the version, and update only if it is older than 0.167.1:

```bash
codex --version
```

```bash
codex update
```

3. If Codex asks you to sign in: run `codex login`, choose **Sign in with ChatGPT**, and sign in with your ChatGPT
   Pro account in the browser window that opens. Do not use an API key here: an API key bills API rates (D1).
4. If anything fails, copy the error to Claude.

Then review each milestone commit, oldest first, from the project folder. Each command prints findings; paste them
to Claude or add them to `docs/fixlist.md`:

```bash
cd C:\Users\Spectre\Desktop\zakovat-progect-dh
```

```bash
codex review --commit eb3154c
```

The other commits, in order: `9b9eeea` (M1), `c33c938` (M2), `8ffc9d7` (M3), `813ea77` (M4), `bb393c9` (M5),
then the two bug-fix commits `4395de5` and `9e87a90`. Reviewing those last two is worth as much as the
milestones: they are the newest code and the only code Claude has reviewed by itself.

### 4.2 GitHub and Vercel for Preview 1 (F4): about 15 minutes

**Nothing secret is involved at this stage.** The app needs **no environment variable** to build or run: there is
no Firebase config and no API key in it yet. Those arrive later — Firebase at M6 (4.3) and the OpenAI key at
M7 (4.4) — and only then does Vercel need anything added to Settings → Environment Variables. If Vercel asks for
environment variables now, leave the section empty.

1. On GitHub, create a **private** empty repository (no README, no .gitignore, no licence), for example
   `zakovat-pdp`.
2. In the project folder, check that everything is committed and that you are on `main`:

```bash
git status
```

```bash
git branch --show-current
```

   `git status` should say "nothing to commit, working tree clean" and the branch should be `main`. If anything is
   uncommitted, stop and tell me rather than committing it yourself.
3. Connect the repository and push (replace `<you>`):

```bash
git remote add origin https://github.com/<you>/zakovat-pdp.git
```

```bash
git push -u origin main
```

4. On vercel.com: **Add New → Project**, then **Import** that repository. On the configuration screen:
   - **Framework Preset: Vite.** Vercel detects it; if it shows anything else, set it to Vite by hand.
   - **Build Command:** `npm run build` — the preset's default, and the same command in `package.json`.
   - **Output Directory:** `dist` — Vite's default, also the preset's default.
   - **Install Command:** leave it alone (`npm install`).
   - **Root Directory:** leave it as `./`.
   - **Node.js version: 22.x.** It is under Settings → General → Node.js Version, and it has to match the
     `engines` field in `package.json`, which says `22.x`. If Vercel offers an older default, change it, or the
     build can fail on a version this project was never tested on.
   - **Environment Variables: none.** See the note above.
5. **Deploy.** The first build takes a minute or two. From then on every push to `main` gets its own preview URL,
   and `main` itself becomes the Production deployment.
6. **The first thing to check on the preview is a deep link with a reload.** The app draws its own pages, so the
   address `/game` is not a real file on the server; without help, a reload there would return 404.
   `vercel.json` (committed 2026-11-11) already handles it: it sends every address except `/api/...` to the app.
   To confirm it works:
   - open the preview URL, play far enough to have a game in progress, then
   - put `/game` on the end of the address bar and press Enter, and
   - press **F5** on that page, and do it once more on `/game/results`.

   Each time you should get the app, not a Vercel 404. If you do see a 404, stop and tell me — that is
   `vercel.json` not being picked up, and nothing else on the preview is worth testing until it is.
   (`/game/results` sends you back to the wheel when the game has not ended yet, and `/game` sends you to the
   main page when there is no game at all. Both are the app working as designed; the only failure is a 404.)
7. Then check that the page is served over `https://` and that no browser console errors appear (F12 → Console).
8. Send the preview URL to Claude: the next step is checking it at three sizes, then your classroom test
   (section 2A), then the eight fixes in section 2C on the real preview rather than on localhost.

> **Production vs preview.** A push to `main` deploys to Production as well as giving a preview URL. That is fine
> while the link is private and unlisted, but do not hand the Production address to teachers until you have been
> through section 2A in a real classroom.

### 4.3 Firebase for M6, accounts (F2): about 15 minutes

**Not needed for the deploy in 4.2.** Do this only when M6 starts; until then the app has no sign-in and asks
for nothing.

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

**Not needed for the deploy in 4.2 either.** The app makes no API call yet; this is the first environment
variable Vercel will ever need, and only at M7.

1. ChatGPT → Settings → Billing → API credits benefit → link it to an API organization you own.
2. platform.openai.com → API keys → create a project key.
3. Vercel → the project → Settings → Environment Variables → `OPENAI_API_KEY` = the key (Preview and Production).
   Never put it in the repo or in chat.

### 4.5 Smaller items

- **F1 logo:** done with the mark you sent (12 Nov, D80). Optional: an SVG of it from PDP would be lighter.
- **F9, F10:** read the drafts (section 2D) and send corrections.
- **F5, the missing reference image:** `references/04-sandiqcha-question-example.png` is named in `PROMPT.md` but was
  never in the folder, and it is in no commit. Nothing uses it: D11 already settles the sandiqcha rule and says that
  example does not fit your own definition. **One word from you closes it** — "not needed" is the recommendation.
- **F7, the official Zakovat rules PDF:** two attempts to fetch it failed, and for a reason that will not change:
  Telegram's public web pages list posts but never serve their attached files. Only you can get it, from the
  Telegram app — open `t.me/zakovat/21153` (the channel's "turnir nizomi" post), download the document and put it in
  `references/`. Low priority: the school version has its own rules (D6–D17) and nothing is waiting on it.

## 5. Continuing in another session, or with Codex

- **Claude, new session:** open this folder in Claude Code and say "continue". `CLAUDE.md` makes it read
  `docs/handoff.md` first, which says where things stand and what is next.
- **Codex:** it cannot see this chat, but it can continue from the repository, which holds everything: all work is
  committed, and the docs record the state, the decisions (D1–D71) and the open items. One thing first: update
  Codex (4.1), because the installed version cannot run your model. `AGENTS.md` already says Codex may edit files
  and commit (D61), so the prompt does not have to grant that. Example prompt:

```text
You are taking over the build of this repository. First read CLAUDE.md, docs/handoff.md, docs/fixlist.md,
docs/owner-guide.md and the headings of docs/decisionlog.md. Do not re-open decided entries. Task: <the next task>.
Follow CLAUDE.md: log decisions in docs/decisionlog.md, add a docs/handoff.md entry, run `npm run check`,
check every UI change in a browser at 1920x1080, 1366x768 and 1280x720, and commit at the end. Never push or deploy.
```

- **Which tool for what:** the brief keeps design and visual review with Claude. Codex suits reviews, logic and
  tests (for example M6's Firestore rules). A UI change from Codex still needs the screenshot check at three sizes.
  The first job worth giving it is the review backlog in 4.1, starting with `4395de5` and `9e87a90`.
