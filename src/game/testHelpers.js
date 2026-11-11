// Shared builders for the engine tests. Not imported by the app.
import { createGame, reduce } from "./game.js";

export const Q = [
  { id: "a", type: "oddiy", text: "Savol A", answer: "A" },
  { id: "b", type: "direktor", text: "Savol B", answer: "B" },
  { id: "c", type: "sandiqcha", text: "Savol C", answer: "C" },
];

/** A seeded generator (mulberry32), so shuffles are random but repeatable in tests. */
export function seeded(seed = 1) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newGame(overrides = {}) {
  return createGame({
    teamNames: ["Bilimdonlar", "Yulduzlar", "Burgutlar"],
    questions: Q,
    lang: "uz",
    now: 0,
    rng: seeded(7),
    ...overrides,
  });
}

export const pocketOf = (game, questionId) => game.pockets.find((p) => p.question.id === questionId).no;

/** Applies actions in order. */
export const play = (game, ...actions) => actions.reduce(reduce, game);
