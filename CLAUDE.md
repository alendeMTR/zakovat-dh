# Zakovat for PDP School — rules for every session in this repo

The brief is `PROMPT.md`. It is the owner's original design; where a decision changed it, `docs/decisionlog.md` wins.
General working style: `~/.claude/CLAUDE.md`.

## 1. Read before you act

Every session, before any work:
- `docs/handoff.md`, in full: where the work stands, what is verified, and what is next. **Read it first.**
- `docs/fixlist.md`: the open items. Before you touch a screen or file, search the file for it.
- `docs/decisionlog.md`: the headings (`grep '^\*\*D'`). Before you propose or change anything, read every entry
  on that subject in full. **Do not re-open a decided entry** without new evidence; if you have some, say so and ask.

Before you change scope, milestones or tests, read `docs/plan.md`.

## 2. Document as you go, at the moment it happens

| When this happens | Write it here, right then |
|---|---|
| You find a bug, a flaw, or something only the owner can do | `docs/fixlist.md`: a row with owner and "done means" |
| You or the owner decide something | `docs/decisionlog.md`: dated, who decided, why; mark **Spec change** if it departs from `PROMPT.md` |
| A structural or architectural change | `docs/handoff.md` session entry, and `docs/plan.md` if the plan changes |
| Something you wrote turns out wrong | Correct it in every place you wrote it, and tell the owner |
| The session ends | An entry at the top of the `docs/handoff.md` Session Log: what changed, what is verified, what is next |

`handoff.md` keeps the newest five Session Log entries. Older entries go to `docs/archive/handoff-YYYY-MM.md` (read on demand).

## 3. Verified means loaded and clicked

- A passing build is not a working page. Anything that renders must be loaded in the browser and clicked through the real path.
- UI changes are checked on screenshots at 1920×1080, 1366×768 and 1280×720. Lint and scripts check logic, data and
  i18n keys only.
- Say what is verified and what is not, every time. The agent cannot verify a real projector, touch boards, sound
  volume or sign-in on school devices; those stay 🟡 for the owner.

## 4. Guardrails

- **Ask or decide.** Ask the owner only when the answer changes architecture, data model or scope; costs money or
  needs an account or key; contradicts `PROMPT.md` or a logged decision; or is hard to undo. Otherwise decide, log it, keep going.
- **Design:** strict and minimal. No decorative colours, banners, illustrations or emoji. Monochrome SVG icons.
  Colour never carries meaning alone. Every block carries real information. Tokens only, no raw hex in components.
- **Game rules are decisions** (D6–D17). Change one only with the owner's OK on the exact rule.
- **Language:** every UI string exists in `uz` and `ru`. Uzbek is Latin, with the ASCII apostrophe (o', g').
  Student-facing text follows the voice rules in `~/.claude/CLAUDE.md`; never translate literally between uz and ru.
  New Uzbek and Russian text is a draft until the owner approves it.
- **Secrets:** API keys live in Vercel env and `.env.local`, never in the repo or the client bundle.
- **Git:** commit at the end of each milestone. Push and deploy only with the owner's OK; Production only after the
  owner has checked a preview.
- **Codex** reviews each milestone (`codex review --uncommitted`, before the commit). Its findings go into
  `docs/fixlist.md`; it never edits the repo.
- **Before every commit:** `npm run check` passes (i18n, lint, tests, build), and UI changes were looked at in the browser.
