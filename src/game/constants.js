// Game rules as data. The decisions behind each value are in docs/decisionlog.md.

export const SCHEMA = 1;

export const QUESTION_TYPES = ["oddiy", "direktor", "sandiqcha"];

// 'extra' means correct + extra bonus (D7, D9).
export const VERDICTS = ["wrong", "correct", "extra"];

export const LIMITS = {
  teams: { min: 2, max: 8 }, // D17
  questions: { min: 1, max: 30 }, // brief: up to 30 per game
  timeSec: { min: 10, max: 600 },
  teamName: { max: 40 },
};

export const DEFAULT_SETTINGS = {
  timeSec: 60, // D14
  extraSec: 20, // D14: hand-ins at or before 20.0 s are in the extra window
  warnSec: 10, // D14
  showScores: true,
  sound: true,
  points: {
    // D9: editable defaults
    oddiy: { correct: 2, extra: 1 },
    sandiqcha: { correct: 3, extra: 1 },
    direktor: { correct: 4, extra: 1 },
  },
};
