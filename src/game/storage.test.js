import { describe, expect, it } from "vitest";
import { BACKUP_KEY, GAME_KEY, clearGame, loadGame, saveGame } from "./storage.js";
import { reduce } from "./game.js";
import { elapsedMs } from "./timer.js";
import { newGame, play } from "./testHelpers.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

const throwingStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("quota");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("saving and loading", () => {
  it("returns the same game after a save", () => {
    const store = memoryStorage();
    const game = play(newGame(), { type: "OPEN_QUESTION", pocketNo: 1 }, { type: "START_TIMER", now: 500 });
    expect(saveGame(game, store)).toBe(true);
    expect(loadGame(store)).toEqual(game);
  });

  it("returns null when nothing is saved, and after clearing", () => {
    const store = memoryStorage();
    expect(loadGame(store)).toBe(null);
    saveGame(newGame(), store);
    clearGame(store);
    expect(loadGame(store)).toBe(null);
  });

  it("keeps a running timer running across a reload, measured from its start", () => {
    const store = memoryStorage();
    const game = play(newGame(), { type: "OPEN_QUESTION", pocketNo: 1 }, { type: "START_TIMER", now: 1000 });
    saveGame(game, store);
    // The page reloads 25 seconds later.
    const restored = loadGame(store);
    expect(elapsedMs(restored.rounds[1].timer, 26000)).toBe(25000);
    const handedIn = reduce(restored, { type: "HAND_IN", teamId: "t2", now: 26000 });
    expect(handedIn.rounds[1].handIns.t2).toBe(25000);
  });
});

describe("unreadable data", () => {
  it("sets broken JSON aside instead of losing it", () => {
    const store = memoryStorage({ [GAME_KEY]: "{not json" });
    expect(loadGame(store)).toBe(null);
    expect(store.data[BACKUP_KEY]).toBe("{not json");
    expect(store.data[GAME_KEY]).toBeUndefined();
  });

  it("sets aside a game from an unknown schema", () => {
    const raw = JSON.stringify({ ...newGame(), schema: 99 });
    const store = memoryStorage({ [GAME_KEY]: raw });
    expect(loadGame(store)).toBe(null);
    expect(store.data[BACKUP_KEY]).toBe(raw);
  });

  it("sets aside an older schema with no migration, and a wrong shape", () => {
    const old = memoryStorage({ [GAME_KEY]: JSON.stringify({ ...newGame(), schema: 0 }) });
    expect(loadGame(old)).toBe(null);
    const shape = memoryStorage({ [GAME_KEY]: JSON.stringify({ schema: 1, teams: "x" }) });
    expect(loadGame(shape)).toBe(null);
    const nul = memoryStorage({ [GAME_KEY]: "null" });
    expect(loadGame(nul)).toBe(null);
  });
});

describe("blocked storage", () => {
  it("never throws: save reports false, load returns null", () => {
    expect(saveGame(newGame(), throwingStorage)).toBe(false);
    expect(loadGame(throwingStorage)).toBe(null);
    expect(() => clearGame(throwingStorage)).not.toThrow();
  });

  it("works without any storage at all", () => {
    expect(saveGame(newGame(), null)).toBe(false);
    expect(loadGame(null)).toBe(null);
  });
});
