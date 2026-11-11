# Fix list

> Open bugs, flaws and blockers. One row per item; never delete a row, change its status.
> Before you fix or build anything, search this file for the screens and files you will touch.
> **Never mark an item ✅ that you could not verify.** Say what you checked and where.
>
> **Status:** ⬜ open · 🔧 fixed locally, not deployed · 🟡 deployed, owner to test · ✅ done and verified ·
> ⏸ waiting on the owner
> **Verified by:** the agent can verify logic, builds and screenshots in the browser pane. It cannot verify
> a real projector, a real classroom, touch boards or sound volume: those stay 🟡 until the owner checks them.

| # | Status | Owner | Item | Done means |
|---|---|---|---|---|
| F1 | ⏸ | Owner | Logo: ask PDP School for the logo as SVG (D26). Until then the 114×41 webp from school.pdp.uz is used at its native size. **2026-11-11:** downloading the interim files into `public/` waits for the owner's OK: `logo-yorug.webp` (2.0 KB), `logo-tungi.webp` (1.6 KB), `favicon.svg` (round mark). Until then the header shows "PDP School" as plain text. | SVG file in `public/`, the webp removed |
| F2 | ⏸ | Owner | Create the Firebase project (Spark plan) and add Google sign-in; paste the web config into `.env.local` when the agent asks (D2, D5). Needed by M6. | Config in `.env.local`; sign-in works on localhost |
| F3 | ⏸ | Owner | Claim the Pro API credits: link the ChatGPT Pro subscription to an API organization you own (ChatGPT → Settings → Billing), create a project API key for the Vercel env. Needed by M7. | Key in Vercel env (never in the repo); one test call succeeds |
| F4 | ⏸ | Owner | Create the private GitHub repo and the Vercel project, or allow the agent to create them with `gh` / Vercel CLI. Needed by the first preview (after M5). | Repo pushed; preview URL loads |
| F5 | ⬜ | Agent | `references/04-sandiqcha-question-example.png` is missing from the folder. Not blocking: the brief says to follow its own sandiqcha definition (D11). | Closed if the owner says it is not needed |
| F6 | ⬜ | Owner | Classroom hardware unknown: projector resolution, touch boards, speakers. The design targets 1280×720 to 1920×1080, mouse and touch, sound with a mute switch. | Checked in a real PDP classroom at the first preview |
| F8 | ⏸ | Owner | **Codex review blocked (2026-11-11).** The installed Codex CLI is 0.142.0 (installed by the Codex app under `AppData/Local/Programs/OpenAI/Codex`); the model on the owner's account, `gpt-5.6-sol`, needs a newer CLI ("requires a newer version of Codex"). Latest on npm: 0.167.1. The owner updates Codex (the app's updater). Then the agent reviews M0 with `codex review --commit <M0 sha>`. The owner will update later (2026-11-11), so every milestone until then is committed unreviewed and reviewed afterwards, commit by commit: M0 `eb3154c`, M1 (see `git log`). | Every unreviewed milestone commit reviewed; findings sorted into this file |
| F9 | ⏸ | Owner | **Approve the sample sets** in `src/game/sampleSets.js`: 10 questions in Uzbek and 10 in Russian (7 Oddiy, 1 Direktor, 2 Sandiqcha). They are drafts: read the wording aloud and correct it, and check the facts (listed in the file header). Also choose the **Russian names of the three types**: "Обычный / Директор / Ящик" are placeholders (D36). Needed before Preview 1, since teachers can pick this set. | Text approved; Russian type names chosen |
| F10 | ⏸ | Owner | **Approve the interface text** in `src/i18n/uz.js` and `src/i18n/ru.js` (main page, setup, questions; 99 keys on 2026-11-11). All of it is a draft: read it aloud in both languages and correct it in the files, or send the changes. Uzbek keeps the ASCII apostrophe (D21). | Both files approved |
| F11 | ✅ | Agent | "Davom ettirish" / "Продолжить" on the main page opens the not-found page until M3 builds `/game` (D43). **2026-11-11:** fixed in M3; verified in the browser (Continue opens the wheel; a reload with a card open reopens that card). | M3 done; the link opens the wheel |
| F12 | ⬜ | Agent | After "O'yinni yakunlash", the game ends and the main page opens; the leaderboard and breakdown come in M5 (D49). The ended game's results are not visible until then. | M5: End game opens the leaderboard |
| F13 | ⬜ | Owner | **Classroom check: pocket numbers with 30 questions.** At 1280×720 they are 16 px tall (2.2% of the screen height); the type icons in them are about 14 px. They are readable on a laptop; from the back row of a classroom they may not be. The question card does not depend on them. If they are too small, the fix is a larger wheel (less room for the side panels) or numbers only on every pocket without icons. | Owner checked 30 pockets on a real projector |
| F7 | ⬜ | Agent | The official Zakovat TV rules (`Zakovat teleo'yini nizomi 2025.pdf`, attached to a post in the @zakovat Telegram channel) could not be downloaded. Low priority: the school version has its own rules. | Read if the owner sends it; terms checked against it |
