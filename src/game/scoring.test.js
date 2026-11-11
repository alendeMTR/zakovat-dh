import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./constants.js";
import { breakdownRows, pointsFor, ranking, teamTotals } from "./scoring.js";
import { newGame, play, pocketOf } from "./testHelpers.js";

describe("points (D9)", () => {
  it("follows the default table", () => {
    const S = DEFAULT_SETTINGS;
    expect([pointsFor(S, "oddiy", "correct"), pointsFor(S, "oddiy", "extra")]).toEqual([2, 3]);
    expect([pointsFor(S, "sandiqcha", "correct"), pointsFor(S, "sandiqcha", "extra")]).toEqual([3, 4]);
    expect([pointsFor(S, "direktor", "correct"), pointsFor(S, "direktor", "extra")]).toEqual([4, 5]);
    expect(pointsFor(S, "direktor", "wrong")).toBe(0);
    expect(pointsFor(S, "oddiy", undefined)).toBe(0);
  });
});

/** Opens, reveals and judges one question per entry: { [questionId]: { t1: 'extra', … } }. */
function judged(verdictsByQuestion, game = newGame()) {
  let g = game;
  for (const [questionId, verdicts] of Object.entries(verdictsByQuestion)) {
    const pocketNo = pocketOf(g, questionId);
    g = play(g, { type: "OPEN_QUESTION", pocketNo }, { type: "REVEAL" });
    for (const [teamId, verdict] of Object.entries(verdicts)) {
      g = play(g, { type: "SET_VERDICT", pocketNo, teamId, verdict });
    }
    g = play(g, { type: "CLOSE_QUESTION", now: 0 });
  }
  return g;
}

describe("totals", () => {
  it("adds up every judged round and counts each kind of verdict", () => {
    const g = judged({
      a: { t1: "extra", t2: "correct", t3: "wrong" }, // oddiy
      b: { t1: "correct", t2: "extra" }, // direktor
    });
    expect(teamTotals(g)).toEqual({
      t1: { score: 3 + 4, correct: 1, extra: 1, wrong: 0 },
      t2: { score: 2 + 5, correct: 1, extra: 1, wrong: 0 },
      t3: { score: 0, correct: 0, extra: 0, wrong: 1 },
    });
  });

  it("follows a corrected verdict, because scores are computed, not stored (D15)", () => {
    const g = judged({ a: { t1: "correct" } });
    const pocketNo = pocketOf(g, "a");
    const fixed = play(g, { type: "SET_VERDICT", pocketNo, teamId: "t1", verdict: "wrong" });
    expect(teamTotals(g).t1.score).toBe(2);
    expect(teamTotals(fixed).t1.score).toBe(0);
  });
});

describe("ranking (D16)", () => {
  it("shares a place between tied teams and skips the next: 1, 1, 3", () => {
    const g = judged({ a: { t2: "correct", t3: "correct" }, c: { t1: "wrong" } }); // t2 2, t3 2, t1 0
    const rows = ranking(g);
    expect(rows.map((r) => [r.team.id, r.score, r.place])).toEqual([
      ["t2", 2, 1],
      ["t3", 2, 1],
      ["t1", 0, 3],
    ]);
  });

  it("keeps setup order inside a tie and gives everyone place 1 before any verdict", () => {
    const rows = ranking(newGame());
    expect(rows.map((r) => [r.team.id, r.place])).toEqual([["t1", 1], ["t2", 1], ["t3", 1]]);
  });
});

describe("breakdown rows", () => {
  it("lists played questions in the order played, with each team's mark, points and hand-in time", () => {
    let g = newGame();
    const c = pocketOf(g, "c");
    const a = pocketOf(g, "a");
    g = play(
      g,
      { type: "OPEN_QUESTION", pocketNo: c },
      { type: "START_TIMER", now: 0 },
      { type: "HAND_IN", teamId: "t1", now: 12000 },
      { type: "REVEAL" },
      { type: "SET_VERDICT", pocketNo: c, teamId: "t1", verdict: "extra" },
      { type: "CLOSE_QUESTION", now: 30000 },
      { type: "OPEN_QUESTION", pocketNo: a },
      { type: "CLOSE_QUESTION", now: 31000 },
    );
    const rows = breakdownRows(g);
    expect(rows.map((r) => r.question.id)).toEqual(["c", "a"]);
    expect(rows[0].marks.t1).toEqual({ verdict: "extra", points: 4, handInMs: 12000 });
    expect(rows[0].marks.t2).toEqual({ verdict: null, points: 0, handInMs: null });
    expect(rows[1].marks.t1.verdict).toBe(null);
  });
});
