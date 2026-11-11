import { describe, expect, it } from "vitest";
import { GameError, createGame, currentQuestion, pickPocket, reduce, unplayedPockets } from "./game.js";
import { teamTotals } from "./scoring.js";
import { Q, newGame, play, pocketOf, seeded } from "./testHelpers.js";

const codeOf = (fn) => {
  try {
    fn();
  } catch (error) {
    return error instanceof GameError ? error.code : `not a GameError: ${error}`;
  }
  return "no error";
};

describe("createGame", () => {
  it("rejects fewer than 2 or more than 8 teams (D17)", () => {
    expect(codeOf(() => newGame({ teamNames: ["Bir"] }))).toBe("teamCount");
    expect(codeOf(() => newGame({ teamNames: Array.from({ length: 9 }, (_, i) => `J${i}`) }))).toBe("teamCount");
    expect(codeOf(() => newGame({ teamNames: Array.from({ length: 8 }, (_, i) => `J${i}`) }))).toBe("no error");
  });

  it("rejects empty and duplicate team names, ignoring case and spaces", () => {
    expect(codeOf(() => newGame({ teamNames: ["A", "  "] }))).toBe("teamName");
    expect(codeOf(() => newGame({ teamNames: ["Burgut", " burgut "] }))).toBe("teamNameDuplicate");
  });

  it("rejects 0 or more than 30 questions, an unknown type, and empty text", () => {
    expect(codeOf(() => newGame({ questions: [] }))).toBe("questionCount");
    const many = Array.from({ length: 31 }, (_, i) => ({ type: "oddiy", text: `S${i}`, answer: "J" }));
    expect(codeOf(() => newGame({ questions: many }))).toBe("questionCount");
    expect(codeOf(() => newGame({ questions: many.slice(0, 30) }))).toBe("no error");
    expect(codeOf(() => newGame({ questions: [{ type: "blits", text: "S", answer: "J" }] }))).toBe("questionType");
    expect(codeOf(() => newGame({ questions: [{ type: "oddiy", text: "S", answer: " " }] }))).toBe("questionEmpty");
  });

  it("rejects an extra window longer than the time", () => {
    expect(codeOf(() => newGame({ settings: { timeSec: 30, extraSec: 31 } }))).toBe("extraSec");
    expect(codeOf(() => newGame({ settings: { timeSec: 5 } }))).toBe("timeSec");
  });

  it("merges points over the defaults, type by type (D9)", () => {
    const game = newGame({ settings: { points: { oddiy: { correct: 5 } } } });
    expect(game.settings.points.oddiy).toEqual({ correct: 5, extra: 1 });
    expect(game.settings.points.direktor).toEqual({ correct: 4, extra: 1 });
    expect(game.settings.timeSec).toBe(60);
  });

  it("puts every question in a numbered pocket, in a repeatable random order", () => {
    const game = newGame();
    expect(game.pockets.map((p) => p.no)).toEqual([1, 2, 3]);
    expect(game.pockets.map((p) => p.question.id).sort()).toEqual(["a", "b", "c"]);
    const again = newGame();
    expect(again.pockets.map((p) => p.question.id)).toEqual(game.pockets.map((p) => p.question.id));
  });

  it("trims names and question text and gives teams stable ids", () => {
    const game = newGame({ teamNames: [" Bir ", "Ikki"], questions: [{ type: "oddiy", text: " S ", answer: " J " }] });
    expect(game.teams).toEqual([{ id: "t1", name: "Bir" }, { id: "t2", name: "Ikki" }]);
    expect(game.pockets[0].question).toMatchObject({ text: "S", answer: "J" });
  });
});

describe("a full round", () => {
  it("records hand-ins against the timer and scores only after verdicts", () => {
    const start = newGame();
    const a = pocketOf(start, "a"); // oddiy: 2 + 1
    const game = play(
      start,
      { type: "OPEN_QUESTION", pocketNo: a },
      { type: "START_TIMER", now: 1000 },
      { type: "HAND_IN", teamId: "t1", now: 16000 },
      { type: "HAND_IN", teamId: "t2", now: 40000 },
    );
    expect(game.rounds[a].handIns).toEqual({ t1: 15000, t2: 39000 });
    expect(teamTotals(game).t1.score).toBe(0);

    const judged = play(
      game,
      { type: "REVEAL" },
      { type: "SET_VERDICT", pocketNo: a, teamId: "t1", verdict: "extra" },
      { type: "SET_VERDICT", pocketNo: a, teamId: "t2", verdict: "correct" },
      { type: "SET_VERDICT", pocketNo: a, teamId: "t3", verdict: "wrong" },
    );
    const totals = teamTotals(judged);
    expect([totals.t1.score, totals.t2.score, totals.t3.score]).toEqual([3, 2, 0]);
    expect(currentQuestion(judged).id).toBe("a");
  });
});

describe("rules that guard against mistakes", () => {
  const opened = () => {
    const g = newGame();
    return { g: reduce(g, { type: "OPEN_QUESTION", pocketNo: 1 }), pocketNo: 1 };
  };

  it("ignores a hand-in before the timer starts", () => {
    const { g } = opened();
    expect(reduce(g, { type: "HAND_IN", teamId: "t1", now: 5000 })).toBe(g);
  });

  it("undoes a hand-in on a second tap (D6)", () => {
    const { g } = opened();
    const once = play(g, { type: "START_TIMER", now: 0 }, { type: "HAND_IN", teamId: "t1", now: 5000 });
    const twice = reduce(once, { type: "HAND_IN", teamId: "t1", now: 9000 });
    expect(twice.rounds[1].handIns).toEqual({});
  });

  it("locks verdicts until the answer is revealed (D8)", () => {
    const { g } = opened();
    expect(reduce(g, { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "correct" })).toBe(g);
  });

  it("clears a verdict when the same one is tapped again, and changes it to another (D15)", () => {
    const { g } = opened();
    const set = play(
      g,
      { type: "REVEAL" },
      { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "correct" },
    );
    expect(set.rounds[1].verdicts).toEqual({ t1: "correct" });
    expect(reduce(set, { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "correct" }).rounds[1].verdicts).toEqual({});
    expect(reduce(set, { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "wrong" }).rounds[1].verdicts).toEqual({ t1: "wrong" });
  });

  it("rejects unknown teams and verdicts", () => {
    const { g } = opened();
    const revealed = reduce(g, { type: "REVEAL" });
    expect(reduce(revealed, { type: "SET_VERDICT", pocketNo: 1, teamId: "t9", verdict: "correct" })).toBe(revealed);
    expect(reduce(revealed, { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "half" })).toBe(revealed);
    expect(reduce(revealed, { type: "HAND_IN", teamId: "t9", now: 1 })).toBe(revealed);
  });

  it("does not open a second question while one is open", () => {
    const { g } = opened();
    expect(reduce(g, { type: "OPEN_QUESTION", pocketNo: 2 })).toBe(g);
  });

  it("returns the same game for an unknown action", () => {
    const g = newGame();
    expect(reduce(g, { type: "NOPE" })).toBe(g);
  });
});

describe("the timer through the reducer", () => {
  it("pauses and resumes, adding up the running time", () => {
    const g = play(
      newGame(),
      { type: "OPEN_QUESTION", pocketNo: 1 },
      { type: "START_TIMER", now: 0 },
      { type: "PAUSE_TIMER", now: 10000 },
      { type: "START_TIMER", now: 50000 },
      { type: "HAND_IN", teamId: "t1", now: 55000 },
    );
    expect(g.rounds[1].handIns.t1).toBe(15000);
  });

  it("resets the timer and the hand-ins but keeps the reveal and verdicts", () => {
    const g = play(
      newGame(),
      { type: "OPEN_QUESTION", pocketNo: 1 },
      { type: "START_TIMER", now: 0 },
      { type: "HAND_IN", teamId: "t1", now: 3000 },
      { type: "REVEAL" },
      { type: "SET_VERDICT", pocketNo: 1, teamId: "t2", verdict: "wrong" },
      { type: "RESET_TIMER" },
    );
    expect(g.rounds[1].timer).toEqual({ startedAt: null, accumulatedMs: 0 });
    expect(g.rounds[1].handIns).toEqual({});
    expect(g.rounds[1].revealed).toBe(true);
    expect(g.rounds[1].verdicts).toEqual({ t2: "wrong" });
  });

  it("stops the timer when the card closes, and keeps the round when it reopens", () => {
    const g = play(
      newGame(),
      { type: "OPEN_QUESTION", pocketNo: 2 },
      { type: "START_TIMER", now: 0 },
      { type: "HAND_IN", teamId: "t3", now: 4000 },
      { type: "CLOSE_QUESTION", now: 7000 },
    );
    expect(g.current).toBe(null);
    expect(g.rounds[2].timer).toEqual({ startedAt: null, accumulatedMs: 7000 });
    const reopened = reduce(g, { type: "OPEN_QUESTION", pocketNo: 2 });
    expect(reopened.current).toBe(2);
    expect(reopened.played).toEqual([2]);
    expect(reopened.rounds[2].handIns).toEqual({ t3: 4000 });
  });
});

describe("pockets", () => {
  it("picks only unplayed pockets and returns null when none are left", () => {
    let g = newGame();
    const rng = seeded(3);
    const seen = [];
    for (let i = 0; i < 3; i += 1) {
      const no = pickPocket(g, rng);
      expect(g.played).not.toContain(no);
      seen.push(no);
      g = play(g, { type: "OPEN_QUESTION", pocketNo: no }, { type: "CLOSE_QUESTION", now: 0 });
    }
    expect(seen.sort()).toEqual([1, 2, 3]);
    expect(unplayedPockets(g)).toEqual([]);
    expect(pickPocket(g, rng)).toBe(null);
  });
});

describe("end of game", () => {
  it("only ends on the teacher's action, closing the open card", () => {
    const g = play(
      newGame({ questions: [Q[0]] }),
      { type: "OPEN_QUESTION", pocketNo: 1 },
      { type: "START_TIMER", now: 0 },
      { type: "CLOSE_QUESTION", now: 1000 },
    );
    // Every pocket is played, and the game is still running (brief: it never ends by itself).
    expect(g.endedAt).toBe(null);
    const ended = reduce(g, { type: "END_GAME", now: 99000 });
    expect(ended.endedAt).toBe(99000);
    expect(ended.current).toBe(null);
  });

  it("closes an open card and stops its timer", () => {
    const g = play(newGame(), { type: "OPEN_QUESTION", pocketNo: 1 }, { type: "START_TIMER", now: 0 });
    const ended = reduce(g, { type: "END_GAME", now: 5000 });
    expect(ended.current).toBe(null);
    expect(ended.rounds[1].timer).toEqual({ startedAt: null, accumulatedMs: 5000 });
  });

  it("blocks play after the end but allows corrections from the breakdown, even unrevealed", () => {
    const g = play(newGame(), { type: "OPEN_QUESTION", pocketNo: 1 }, { type: "END_GAME", now: 1 });
    expect(reduce(g, { type: "OPEN_QUESTION", pocketNo: 2 })).toBe(g);
    expect(reduce(g, { type: "END_GAME", now: 2 })).toBe(g);
    const fixed = reduce(g, { type: "SET_VERDICT", pocketNo: 1, teamId: "t1", verdict: "correct" });
    expect(fixed.rounds[1].verdicts).toEqual({ t1: "correct" });
  });

  it("lets the teacher show and hide scores at any time (D22)", () => {
    const g = newGame();
    expect(reduce(g, { type: "TOGGLE_SCORES" }).settings.showScores).toBe(false);
    expect(play(g, { type: "TOGGLE_SCORES" }, { type: "TOGGLE_SCORES" }).settings.showScores).toBe(true);
  });
});

describe("createGame input is not mutated", () => {
  it("leaves the caller's question objects untouched", () => {
    const questions = [{ id: "x", type: "oddiy", text: " S ", answer: " J " }];
    createGame({ teamNames: ["A", "B"], questions, lang: "uz", now: 0 });
    expect(questions[0]).toEqual({ id: "x", type: "oddiy", text: " S ", answer: " J " });
  });
});
