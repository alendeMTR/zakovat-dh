// The running game lives in the browser and is saved after every action (D15 reload rule, plan §3).
// One unfinished game at a time. Storage can be blocked or full; every call is wrapped so a failed
// save never breaks the game on screen.

import { SCHEMA } from "./constants.js";

export const GAME_KEY = "zakovat.game";
export const BACKUP_KEY = "zakovat.game.unreadable";

// Older schemas are upgraded here, one step at a time: { 1: (game) => ({ ...game, schema: 2 }) }.
const MIGRATIONS = {};

const defaultStorage = () => (typeof localStorage === "undefined" ? null : localStorage);

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
  return (
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
  );
}
