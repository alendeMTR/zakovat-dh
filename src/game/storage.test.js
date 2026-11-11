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

  it("round-trips a game in full flight: a reopened pocket, hand-ins, verdicts, hidden scores", () => {
    const store = memoryStorage();
    const game = play(
      newGame({ settings: { timeSec: 10, extraSec: 0, points: { oddiy: { correct: 0, extra: 20 } } } }),
      { type: "OPEN_QUESTION", pocketNo: 1 },
      { type: "START_TIMER", now: 1000 },
      { type: "HAND_IN", teamId: "t1", now: 4000 },
      { type: "REVEAL" },
      { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "extra" },
      { type: "CLOSE_QUESTION", now: 9000 },
      { type: "TOGGLE_SCORES" },
      { type: "TOGGLE_SOUND" },
      { type: "OPEN_QUESTION", pocketNo: 1 }, // reopened to fix a mistake (D34)
    );
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
  // F19/F21 regression: each of these used to load and then throw on a game screen.
  it("sets aside invalid nested state before it reaches a game screen", () => {
    const opened = play(newGame(), { type: "OPEN_QUESTION", pocketNo: 1 });
    const corruptions = [
      (g) => { g.current = 99; }, // currentQuestion() threw on the wheel
      (g) => { g.current = 2; }, // a pocket that was never played has no round
      (g) => { delete g.rounds[1]; },
      (g) => { g.rounds[1].timer = null; },
      (g) => { g.rounds[1].timer.accumulatedMs = -1; },
      (g) => { g.rounds[1].timer.startedAt = "now"; },
      (g) => { delete g.rounds[1].revealed; },
      (g) => { g.rounds[1].verdicts.t1 = "unknown"; },
      (g) => { g.rounds[1].verdicts.t9 = "correct"; }, // no such team
      (g) => { g.rounds[1].handIns.t1 = "10"; },
      (g) => { g.teams[0] = null; },
      (g) => { g.teams[1].id = "t1"; }, // two teams with one id
      (g) => { g.pockets[0].question.type = "unknown"; },
      (g) => { g.pockets[0].question.text = "  "; },
      (g) => { g.pockets[1].no = 7; }, // pockets are numbered 1..N in order
      (g) => { g.played = [1, 1]; },
      (g) => { g.settings.points = null; },
      (g) => { g.settings.points.oddiy = null; },
      (g) => { g.settings.points.oddiy.correct = -1; },
      (g) => { g.settings.points.direktor.extra = 1.5; },
      (g) => { delete g.settings.timeSec; },
      (g) => { g.settings.extraSec = 999; }, // longer than the question's own time
      (g) => { delete g.settings.sound; },
      (g) => { delete g.endedAt; },
      (g) => { g.lang = "en"; },
    ];
    for (const corrupt of corruptions) {
      const game = structuredClone(opened);
      corrupt(game);
      const raw = JSON.stringify(game);
      const store = memoryStorage({ [GAME_KEY]: raw });
      expect(loadGame(store)).toBe(null);
      expect(store.data[BACKUP_KEY]).toBe(raw);
      expect(store.data[GAME_KEY]).toBeUndefined();
    }
  });

  it("keeps finished games with corrected verdicts readable", () => {
    const game = play(newGame(), { type: "OPEN_QUESTION", pocketNo: 1 }, { type: "END_GAME", now: 1000 },
      { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "extra" });
    const store = memoryStorage();
    saveGame(game, store);
    expect(loadGame(store)).toEqual(game);
  });
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
  it("also handles a denied localStorage property getter", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("denied"); } });
    try {
      expect(loadGame()).toBe(null);
      expect(saveGame(newGame())).toBe(false);
      expect(() => clearGame()).not.toThrow();
    } finally {
      if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
      else delete globalThis.localStorage;
    }
  });
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
