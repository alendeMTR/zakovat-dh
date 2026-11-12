import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./constants.js";
import {
  breakdownRows,
  focusPocket,
  gameInsights,
  placeMoves,
  pointsFor,
  ranking,
  roundPoints,
  roundSummary,
  teamTotals,
} from "./scoring.js";
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

describe("live details for the ranking panel (D74)", () => {
  const timed = (pocketNo, handIns, verdicts) => (g) => {
    let next = play(g, { type: "OPEN_QUESTION", pocketNo }, { type: "START_TIMER", now: 0 });
    for (const [teamId, ms] of Object.entries(handIns)) next = play(next, { type: "HAND_IN", teamId, now: ms });
    next = play(next, { type: "REVEAL" });
    for (const [teamId, verdict] of Object.entries(verdicts)) {
      next = play(next, { type: "SET_VERDICT", pocketNo, teamId, verdict, now: 30000 });
    }
    return play(next, { type: "CLOSE_QUESTION", now: 30000 });
  };

  it("reports on the open card, else on the last question played, else on nothing", () => {
    const g = newGame();
    expect(focusPocket(g)).toBe(null);
    const one = judged({ a: { t1: "correct" } }, g);
    expect(focusPocket(one)).toBe(pocketOf(one, "a"));
    const open = play(one, { type: "OPEN_QUESTION", pocketNo: pocketOf(one, "b") });
    expect(focusPocket(open)).toBe(pocketOf(one, "b"));
  });

  it("gives each team's points on one question and how many places it moved", () => {
    const g0 = newGame();
    const a = pocketOf(g0, "a");
    const b = pocketOf(g0, "b");
    // After a: t2 leads (3), t1 second (2), t3 last. After b (direktor): t3 jumps to first with 5.
    const g = timed(b, {}, { t3: "extra" })(timed(a, {}, { t1: "correct", t2: "extra" })(g0));
    expect(roundPoints(g, b)).toEqual({ t1: 0, t2: 0, t3: 5 });
    expect(placeMoves(g, b)).toEqual({ t1: -1, t2: -1, t3: 2 });
    // Without a, t1 and t2 share 2nd on 0 (D16); a puts t2 on 3 and t1 on 2, so t1 drops to 3rd.
    expect(placeMoves(g, a)).toEqual({ t1: -1, t2: 0, t3: 0 });
  });

  it("summarises a round: judged, right, and the fastest correct hand-in", () => {
    const g0 = newGame();
    const a = pocketOf(g0, "a");
    const g = timed(a, { t1: 9000, t2: 4000, t3: 2000 }, { t1: "correct", t2: "extra", t3: "wrong" })(g0);
    const s = roundSummary(g, a);
    expect([s.judged, s.correct, s.total]).toEqual([3, 2, 3]);
    expect(s.fastest.team.id).toBe("t2"); // t3 was quicker but wrong
    expect(s.fastest.ms).toBe(4000);
  });
});

describe("insights for the results page (D75)", () => {
  it("finds the fastest correct answer, the hardest question and the most extra bonuses", () => {
    const g0 = newGame();
    const [a, b, c] = ["a", "b", "c"].map((id) => pocketOf(g0, id));
    let g = play(g0, { type: "OPEN_QUESTION", pocketNo: a }, { type: "START_TIMER", now: 0 },
      { type: "HAND_IN", teamId: "t1", now: 7000 }, { type: "HAND_IN", teamId: "t2", now: 3000 }, { type: "REVEAL" },
      { type: "SET_VERDICT", pocketNo: a, teamId: "t1", verdict: "extra" },
      { type: "SET_VERDICT", pocketNo: a, teamId: "t2", verdict: "wrong" },
      { type: "CLOSE_QUESTION", now: 9000 });
    g = judged({ b: { t1: "wrong", t2: "wrong", t3: "correct" }, c: { t1: "extra", t2: "correct", t3: "correct" } }, g);
    const { fastest, hardest, extras } = gameInsights(g);
    expect(fastest).toMatchObject({ ms: 7000, pocketNo: a });
    expect(fastest.team.id).toBe("t1");
    expect(hardest).toMatchObject({ pocketNo: a, correct: 1, judged: 2 }); // a and b both have 1 right; a came first
    expect(extras.teams.map((t) => t.id)).toEqual(["t1"]);
    expect(extras.n).toBe(2);
    expect(b).not.toBe(c);
  });

  it("returns nulls for a game with nothing judged", () => {
    expect(gameInsights(newGame())).toEqual({ fastest: null, hardest: null, extras: null });
  });
});
