// The running game lives in the browser and is saved after every action (D15 reload rule, plan §3).
// One unfinished game at a time. Storage can be blocked or full; every call is wrapped so a failed
// save never breaks the game on screen.

import { QUESTION_TYPES, SCHEMA, VERDICTS } from "./constants.js";
import { createGame } from "./game.js";

export const GAME_KEY = "zakovat.game";
export const BACKUP_KEY = "zakovat.game.unreadable";

// Older schemas are upgraded here, one step at a time: { 1: (game) => ({ ...game, schema: 2 }) }.
const MIGRATIONS = {};

const defaultStorage = () => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

/** Returns true when the game was written. */
export function saveGame(game, storage = defaultStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(GAME_KEY, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the saved game, or null when there is none or it cannot be read.
 * An unreadable game is copied to BACKUP_KEY before it is dropped, so nothing is lost silently.
 */
export function loadGame(storage = defaultStorage()) {
  if (!storage) return null;
  let raw;
  try {
    raw = storage.getItem(GAME_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  let game;
  try {
    game = JSON.parse(raw);
  } catch {
    return setAside(raw, storage);
  }

  while (game && typeof game.schema === "number" && game.schema < SCHEMA && MIGRATIONS[game.schema]) {
    game = MIGRATIONS[game.schema](game);
  }
  if (!isGameShape(game)) return setAside(raw, storage);
  return game;
}

export function clearGame(storage = defaultStorage()) {
  if (!storage) return;
  try {
    storage.removeItem(GAME_KEY);
  } catch {
    // Nothing to do: the next save overwrites it.
  }
}

function setAside(raw, storage) {
  try {
    storage.setItem(BACKUP_KEY, raw);
    storage.removeItem(GAME_KEY);
  } catch {
    // Storage refused; the game stays where it was and is simply not loaded.
  }
  return null;
}

function isGameShape(game) {
  if (!(
    game !== null &&
    typeof game === "object" &&
    game.schema === SCHEMA &&
    Array.isArray(game.teams) &&
    Array.isArray(game.pockets) &&
    Array.isArray(game.played) &&
    typeof game.rounds === "object" &&
    game.rounds !== null &&
    typeof game.settings === "object" &&
    game.settings !== null
  )) return false;

  const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const id = (value) => typeof value === "string" && value.length > 0;
  const time = (value) => Number.isFinite(value) && value >= 0;
  const nullableTime = (value) => value === null || time(value);
  try {
    // Reuse the creation boundary for question, team and settings validation.
    createGame({
      teamNames: game.teams.map((team) => team.name),
      questions: game.pockets.map((pocket) => pocket.question),
      settings: game.settings,
      lang: game.lang,
      now: game.createdAt,
      rng: () => 0,
    });
    if (!id(game.id) || !["uz", "ru"].includes(game.lang) || !time(game.createdAt) || !nullableTime(game.endedAt)) return false;
    if (!record(game.rounds) || typeof game.settings.showScores !== "boolean" || typeof game.settings.sound !== "boolean") return false;
    // createGame fills missing settings from the defaults, so what is stored has to be checked for itself:
    // a game saved with points: null would load and then break scoring.
    if (!["timeSec", "extraSec", "warnSec"].every((key) => Number.isInteger(game.settings[key]))) return false;
    if (!record(game.settings.points)) return false;
    if (!QUESTION_TYPES.every((type) =>
      record(game.settings.points[type]) &&
      ["correct", "extra"].every((field) => Number.isInteger(game.settings.points[type][field])))) return false;
    if (!game.pockets.every((p, i) => p.no === i + 1 && id(p.question.id))) return false;
    const teamIds = new Set(game.teams.map((team) => team.id));
    if (teamIds.size !== game.teams.length || !game.teams.every((team) => id(team.id) && typeof team.name === "string")) return false;
    if (new Set(game.played).size !== game.played.length) return false;
    if (!game.played.every((no) => Number.isInteger(no) && no >= 1 && no <= game.pockets.length)) return false;
    if (game.current !== null && !game.played.includes(game.current)) return false;
    if (game.endedAt !== null && game.current !== null) return false;
    if (Object.keys(game.rounds).length !== game.played.length) return false;
    return game.played.every((no) => {
      const round = game.rounds[no];
      return record(round) && typeof round.revealed === "boolean" &&
        record(round.timer) && nullableTime(round.timer.startedAt) && time(round.timer.accumulatedMs) &&
        record(round.handIns) && Object.entries(round.handIns).every(([teamId, ms]) => teamIds.has(teamId) && time(ms)) &&
        record(round.verdicts) && Object.entries(round.verdicts).every(([teamId, verdict]) => teamIds.has(teamId) && VERDICTS.includes(verdict));
    });
  } catch {
    return false;
  }
}
