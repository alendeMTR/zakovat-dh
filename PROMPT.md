# Zakovat platform for PDP School — project prompt

## Role

You are the lead engineer and product designer on this project. You own the architecture, the UI/UX and the code. I own the decisions you put to me. Work like a senior: ask the few questions that matter, then build without hand-holding.

## Context

- **Zakovat** is Uzbekistan's intellectual team quiz (TV format, close to "Что? Где? Когда?"). Search the web for its official format and terms. Our school version differs; it is described in the Spec below.
- **Client:** PDP School. Find the official logo and brand colors (their website and social pages). Use the official logo file; do not redraw it.
- **Users:** a teacher runs a game in a classroom. Students play in teams.
- **My reference repo:** `C:\Users\Spectre\Desktop\axiomanodev1` (Axeno, my other project; same stack: React + Vite, Firebase, Vercel). Read it, do not modify it. Take from it:
  - the design language: typography, spacing, restraint, how color is used;
  - the documentation system: `CLAUDE.md`, `.axeno-docs/Handoff.md`, `Fix-List.md`, `Plan.md`, `QA-Checklist.md`, `Engineering-Lessons.md`.
- **Main-page reference:** axeno.uz — one clear primary action, little else.
- **Visual references** in `references/`:
  - `01-existing-question-card.webp`, `02-existing-wheel.webp` — an existing Zakovat platform. Take the **game format** from them: three question types with a color each, one row per team with three verdict buttons, a live team ranking. Do **not** copy their visual style.
  - `03-wheel-structure.png` — the wheel structure to keep: outer rim, ring of numbered pockets, inner bowl, centre hub. Make it flat 2D in PDP School colors. Logo in the centre or not: your call.
  - `04-sandiqcha-question-example.png` — the existing platform's Zakovat sandiqchasi card. Use it only as an example of question content. Ignore its design and the incoming-call notification in the top-right corner.

## Expected result

A web platform teachers use to set up and run Zakovat games with teams:
main page → game setup → wheel → question card → scoring → end game → leaderboard → per-question breakdown → back to main page.

My Spec below is preferences and examples, not hard limits. You may change any part of it; state the reason each time. Look for flaws in my design and propose fixes **before** you build.

## Format

- **Stack:** React for the front end. Python only where it earns its place (for example, an AI-generation endpoint); if JS serverless functions do the job better, say so. Deploy on Vercel. Firebase for auth and database — only as far as the Accounts decision below needs them.
- **Phases.** No code before I approve the plan.
  1. **Research and read.** Web: Zakovat format, PDP School logo and colors, axeno.uz. Repo: axiomanodev1 design and docs. No questions to me yet.
  2. **One message to me** with: (a) your questions, (b) flaws in my Spec with proposed fixes, (c) your Claude-vs-Codex answer, (d) your Accounts recommendation.
  3. **Plan:** architecture, data model, screens, milestones, test plan. Wait for my approval.
  4. **Build** milestone by milestone, autonomously. After each milestone: what is done, what is verified, what is next.
  5. **Deploy** a Vercel preview first; production after I check it.

## Other details — how to work with me

**Ask or decide**
- Ask me only when the answer (a) changes architecture, data model or scope, (b) costs money or needs an account or key from me, (c) contradicts something I specified, or (d) is hard to undo later.
- Everything else: decide, write the decision and its reason in `docs/decisionlog.md`, and keep going.
- Before you ask, check whether research or the code answers it. Do not ask what you can look up.
- First round: one batch, at most ~10 questions, ordered by impact. Each question carries your recommended answer and the trade-off in one line, so I can reply "ok" or pick a letter.
- During the build: if you find something important you missed, ask that one question, and keep working on what it does not affect.
- Do not spend my time on choices you can make without drawbacks.

**Claude or Codex** — answer this first, in phase 2. Is Claude alone enough for this project, or should some tasks go to Codex? I have ChatGPT Pro. As far as I know, it covers Codex (CLI, IDE, cloud) when I sign in with my ChatGPT account, but it does not include OpenAI API credits. Verify this. If you recommend Codex, name the exact tasks and how the handoff works.

**Delegation**
- Design decisions, design tokens and visual review stay with you, the main model.
- You may delegate generation (HTML/CSS scaffolding, token files, seed data, tests) to subagents or Codex.
- Review every delegated UI change visually: screenshots in the browser, at projector size and laptop size. Lint and script checks are not enough for UI. They are fine for logic, data and i18n key coverage.

**Skill:** `ui-ux-pro-max` is available. Use it if it helps; say whether you did and why.

**Repo docs** — update them as you work, not at the end. Scale down the axiomanodev1 system:
- `CLAUDE.md` — rules for future sessions in this repo.
- `docs/handoff.md` — session log: what changed, what is verified, what is next; every structural or architectural change.
- `docs/decisionlog.md` — every decision with date and reason, including each place you rejected my initial design (rules, data, scoring, flows — not only UI).
- `docs/fixlist.md` — open bugs and flaws.
- Add other files only if they earn their place.

## Spec — my current design

### Design
- Minimal, educational, strict. No decorative colors, banners or illustrations.
- Every block carries real information. No filler blocks. The page is not empty either.
- PDP School logo in the top-left corner of the main page.
- Readable academic fonts, not display fonts. Question text readable from the back of a classroom on a projector.
- Icons: monochrome SVG. No emoji.

### Game rules (PDP School version)
- Up to 30 questions per game. Default: 10.
- Three question types. Each has its own color on the wheel and on the card:
  - **Oddiy savol** — a standard question.
  - **Direktor savoli** — the director's question. Its rules are not defined yet; ask me.
  - **Zakovat sandiqchasi** — an object is in a box; teams guess what it is. The question describes the object indirectly: a short story, a riddle or an unexpected fact. Examples: "Bald people robbed a house. They took everything except one item. That item is in this box." Answer: a comb. "Every Uzbek person has it." Answer: a comb.
  - The sandiqcha question in `references/04-sandiqcha-question-example.png` ("retell a wise thought from the story 'Garov' in your own words") does not fit this definition. Follow my definition.
- A spinning wheel picks the next question at random. Used questions leave the wheel or are marked as used.
- All teams answer every question. Each team answers when it is ready, inside the given time. There is no turn order. The existing platform's "Javob beruvchi: Jamoa 2" (one designated team) is not our rule.
- Each question has a timer. A team that answers before the extra-point threshold earns a bonus. The platform does not judge this; the teacher does.
- For each team the teacher marks: wrong / correct / correct + extra.
- Scores update live for each team.

### Main page and setup
- Main page: one clearly labelled primary button to start a new game. Little else on the page.
- Setup fields: number of teams (sensible limits — you set them), team names, time per question, extra-point threshold (used only to color the timer), question source (switch: "AI-generated" / "Manual"), show or hide scores (shown by default).

### Question card
- A floating card over the wheel.
- **Timer** at top centre, about 20–30% of the card (your call). Monochrome SVG clock icon. Three color states: one during the extra-point window, neutral after it, a warning color when little time is left.
- **Question text**, large.
- **Team rows** at the bottom: team name, answered / not answered, and three verdict buttons shown as icons, not text (correct + extra, correct, wrong).
- A visible place for each team's points.

### End of game
- The game never ends by itself. The teacher may give a speech after the last question. Provide an explicit "End game" control.
- After it: the leaderboard. Then a "show breakdown" view: each question, its answer, and how each team was marked — like a graded test.
- From the leaderboard, a clear way back to the main page.

### Language
- The whole UI in Uzbek and Russian, with a switch.

### Accounts — decide and explain in 3–5 lines
Options: an account per teacher, one shared school account, or no sign-in at all. Base the choice on what data we keep (past games and results, question sets, statistics) and why that data is worth keeping. If nothing needs to persist across devices, we may not need accounts.

### Testing
- Use a fixed template set of questions: all three types, in Uzbek and Russian. No AI generation during tests.

## Known gaps — start here, then add your own

Settle each one by research, by your own decision (logged), or in your phase-2 questions.

1. **Answer signal.** Teams answer when they are ready. How does a team signal it: hands in a written answer, raises a hand? Does the teacher mark "answered" at that moment (the platform records the time), or only when giving the verdict?
2. **Points.** How many for correct and for extra? Do Direktor savoli and Zakovat sandiqchasi score differently?
3. **Type mix.** How many questions of each type per game, and who sets it?
4. **Screens.** One projector screen, where students also see the teacher's controls? Or a teacher device plus a separate projector view?
5. **Answer reveal.** Is the correct answer shown on screen? If so, when — after the timer, or on the teacher's click? It must stay hidden until then.
6. **Timer controls.** Auto-start or manual start, pause, reset; what happens at zero (sound or not).
7. **Mistaken clicks.** The teacher needs a way to undo or change a verdict.
8. **Page reload.** A reload or a closed tab mid-game must not lose the game.
9. **AI generation.** Which provider, who pays for it, what the teacher enters (topic, grade, language), and whether the teacher reviews and edits questions before the game. Manual entry of 10–30 questions is slow: consider paste or import, and saved question sets (this ties to Accounts).
10. **Hidden scores.** Hidden from whom, and can the teacher toggle it mid-game?
11. **Ties** in the final ranking.
12. **Language details.** Uzbek in Latin script only? Is one game's question set in one language?
13. **Wheel size.** The wheel must look right with 10 pockets and with 30.
