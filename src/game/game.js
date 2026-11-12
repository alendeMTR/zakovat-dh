// The game engine: pure functions, no React, no clock, no randomness of its own.
// Time (`now`) and randomness (`rng`) come in from the caller, so every rule is testable.
// Model: docs/plan.md §3. Rules: docs/decisionlog.md D6–D17.

import { DEFAULT_SETTINGS, LIMITS, QUESTION_TYPES, SCHEMA, VERDICTS } from "./constants.js";
import { NEW_TIMER, elapsedMs, hasStarted, isRunning } from "./timer.js";

export class GameError extends Error {
  constructor(code, detail) {
    super(detail ? `${code}: ${detail}` : code);
    this.code = code;
  }
}

/**
 * Builds a new game. Questions go into pockets numbered 1..N in random order.
 * Throws GameError on input the setup screens should have caught.
 */
export function createGame({ teamNames, questions, lang, settings = {}, now, rng = Math.random, id }) {
  const names = (teamNames ?? []).map((name) => String(name).trim());
  if (names.length < LIMITS.teams.min || names.length > LIMITS.teams.max)
    throw new GameError("teamCount", String(names.length));
  if (names.some((name) => name === "" || name.length > LIMITS.teamName.max))
    throw new GameError("teamName");
  if (new Set(names.map((n) => n.toLocaleLowerCase())).size !== names.length)
    throw new GameError("teamNameDuplicate");

  const list = questions ?? [];
  if (list.length < LIMITS.questions.min || list.length > LIMITS.questions.max)
    throw new GameError("questionCount", String(list.length));
  list.forEach((q, i) => {
    if (!QUESTION_TYPES.includes(q.type)) throw new GameError("questionType", `#${i + 1}`);
    if (!q.text?.trim() || !q.answer?.trim()) throw new GameError("questionEmpty", `#${i + 1}`);
  });

  const merged = mergeSettings(settings);
  const whole = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  if (!whole(merged.timeSec, LIMITS.timeSec.min, LIMITS.timeSec.max))
    throw new GameError("timeSec");
  if (!whole(merged.extraSec, 0, merged.timeSec)) throw new GameError("extraSec");
  if (!whole(merged.warnSec, 0, merged.timeSec)) throw new GameError("warnSec");
  for (const type of QUESTION_TYPES) {
    for (const field of ["correct", "extra"]) {
      if (!whole(merged.points[type][field], LIMITS.points.min, LIMITS.points.max))
        throw new GameError("points");
    }
  }

  const shuffled = shuffle(
    list.map((q, i) => ({ id: q.id ?? `q${i + 1}`, type: q.type, text: q.text.trim(), answer: q.answer.trim() })),
    rng,
  );

  return {
    schema: SCHEMA,
    id: id ?? `g${now}`,
    lang,
    createdAt: now,
    endedAt: null,
    settings: merged,
    teams: names.map((name, i) => ({ id: `t${i + 1}`, name })),
    pockets: shuffled.map((question, i) => ({ no: i + 1, question })),
    rounds: {},
    played: [],
    current: null,
  };
}

function mergeSettings(settings) {
  const points = {};
  for (const type of QUESTION_TYPES) {
    points[type] = { ...DEFAULT_SETTINGS.points[type], ...(settings.points?.[type] ?? {}) };
  }
  return { ...DEFAULT_SETTINGS, ...settings, points };
}

function shuffle(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A random pocket that has not been played, or null when every pocket is used. */
export function pickPocket(game, rng = Math.random) {
  const free = unplayedPockets(game);
  if (free.length === 0) return null;
  return free[Math.floor(rng() * free.length)];
}

export const unplayedPockets = (game) =>
  game.pockets.map((p) => p.no).filter((no) => !game.played.includes(no));

export const currentRound = (game) => (game.current === null ? null : game.rounds[game.current]);

export const currentQuestion = (game) =>
  game.current === null ? null : game.pockets.find((p) => p.no === game.current).question;

const newRound = () => ({ timer: { ...NEW_TIMER }, revealed: false, handIns: {}, verdicts: {} });

const withRound = (game, pocketNo, change) => ({
  ...game,
  rounds: { ...game.rounds, [pocketNo]: { ...game.rounds[pocketNo], ...change } },
});

const stopTimer = (timer, now) =>
  isRunning(timer) ? { startedAt: null, accumulatedMs: elapsedMs(timer, now) } : timer;

const hasTeam = (game, teamId) => game.teams.some((t) => t.id === teamId);

/**
 * Applies one action. Returns the same object when the action is not allowed, so the UI can
 * compare references to see whether anything changed.
 */
export function reduce(game, action) {
  const ended = game.endedAt !== null;
  switch (action.type) {
    case "OPEN_QUESTION": {
      // A played pocket can be reopened to fix a mistake; a new pocket starts a round.
      const { pocketNo } = action;
      if (ended || game.current !== null) return game;
      if (!game.pockets.some((p) => p.no === pocketNo)) return game;
      if (game.played.includes(pocketNo)) return { ...game, current: pocketNo };
      return {
        ...game,
        current: pocketNo,
        played: [...game.played, pocketNo],
        rounds: { ...game.rounds, [pocketNo]: newRound() },
      };
    }

    case "CLOSE_QUESTION": {
      if (game.current === null) return game;
      const round = game.rounds[game.current];
      const closed = withRound(game, game.current, { timer: stopTimer(round.timer, action.now) });
      return { ...closed, current: null };
    }

    case "START_TIMER": {
      const round = currentRound(game);
      if (!round || ended || isRunning(round.timer)) return game;
      return withRound(game, game.current, { timer: { ...round.timer, startedAt: action.now } });
    }

    case "PAUSE_TIMER": {
      const round = currentRound(game);
      if (!round || !isRunning(round.timer)) return game;
      return withRound(game, game.current, { timer: stopTimer(round.timer, action.now) });
    }

    case "RESET_TIMER": {
      // A restart of the question: hand-ins timed against the old start would be wrong, so they go too.
      // Verdicts and the reveal stay.
      const round = currentRound(game);
      if (!round || ended) return game;
      return withRound(game, game.current, { timer: { ...NEW_TIMER }, handIns: {} });
    }

    case "HAND_IN": {
      // One tap records the time since the timer started; a second tap undoes it (D6).
      const round = currentRound(game);
      const { teamId } = action;
      if (!round || ended || !hasTeam(game, teamId) || !hasStarted(round.timer)) return game;
      const handIns = { ...round.handIns };
      if (teamId in handIns) delete handIns[teamId];
      else handIns[teamId] = elapsedMs(round.timer, action.now);
      return withRound(game, game.current, { handIns });
    }

    case "REVEAL": {
      const round = currentRound(game);
      if (!round || round.revealed) return game;
      return withRound(game, game.current, { revealed: true });
    }

    case "SET_VERDICT": {
      // Allowed after the reveal (D8), and from the breakdown once the game has ended (D15).
      // The same verdict again clears it.
      const { pocketNo, teamId, verdict } = action;
      const round = game.rounds[pocketNo];
      if (!round || !hasTeam(game, teamId) || !VERDICTS.includes(verdict)) return game;
      if (!round.revealed && !ended) return game;
      const verdicts = { ...round.verdicts };
      if (verdicts[teamId] === verdict) delete verdicts[teamId];
      else verdicts[teamId] = verdict;
      // D72 (owner): once every team on the open question has a verdict, its clock stops — there is
      // nobody left to time. Clearing a verdict afterwards does not restart it.
      const allJudged = game.teams.every((team) => team.id in verdicts);
      const stop = pocketNo === game.current && allJudged && isRunning(round.timer) && Number.isFinite(action.now);
      return withRound(game, pocketNo, stop ? { verdicts, timer: stopTimer(round.timer, action.now) } : { verdicts });
    }

    case "TOGGLE_SCORES":
      return { ...game, settings: { ...game.settings, showScores: !game.settings.showScores } };

    case "TOGGLE_SOUND":
      return { ...game, settings: { ...game.settings, sound: !game.settings.sound } };

    case "END_GAME": {
      // The game never ends by itself (brief); only this action ends it.
      if (ended) return game;
      const closed = game.current === null ? game : reduce(game, { type: "CLOSE_QUESTION", now: action.now });
      return { ...closed, endedAt: action.now };
    }

    default:
      return game;
  }
}
