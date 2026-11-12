// The game being prepared (setup + questions), kept in the browser so a reload or a closed tab
// does not lose 20 typed questions. It stays after the game starts, so the same set can be
// played again with another class; "Clear list" empties it.

import { DEFAULT_SETTINGS, LIMITS, QUESTION_TYPES } from "../game/constants.js";

export const DRAFT_KEY = "zakovat.draft";
export const DRAFT_BACKUP_KEY = "zakovat.draft.unreadable";
export const DEFAULT_TEAM_COUNT = 4;
export const POINTS_MAX = LIMITS.points.max;

// Longer than this and the card may not fit the question on a 1280x720 screen: its box scrolls
// instead of clipping the text (D51). The list says so before the lesson, where it can still be
// shortened (fixlist F14). The card's own behaviour is unchanged.
export const LONG_QUESTION_CHARS = 250;

export const isLongQuestion = (text) => String(text ?? "").trim().length > LONG_QUESTION_CHARS;

const defaultStorage = () => (typeof localStorage === "undefined" ? null : localStorage);

export function newDraft(lang) {
  return {
    teamCount: DEFAULT_TEAM_COUNT,
    teamNames: Array(LIMITS.teams.max).fill(""),
    settings: {
      timeSec: DEFAULT_SETTINGS.timeSec,
      extraSec: DEFAULT_SETTINGS.extraSec,
      showScores: DEFAULT_SETTINGS.showScores,
      sound: DEFAULT_SETTINGS.sound,
      points: structuredClone(DEFAULT_SETTINGS.points),
    },
    lang,
    questions: [],
  };
}

export function loadDraft(lang, storage = defaultStorage()) {
  let raw;
  try {
    raw = storage?.getItem(DRAFT_KEY);
  } catch {
    return newDraft(lang); // storage is blocked; this visit starts fresh
  }
  if (!raw) return newDraft(lang);
  let draft;
  try {
    draft = JSON.parse(raw);
  } catch {
    return setAside(raw, storage, lang);
  }
  return isDraftShape(draft) ? draft : setAside(raw, storage, lang);
}

/**
 * A draft that cannot be used is moved to DRAFT_BACKUP_KEY and the teacher gets an empty one,
 * the same way an unreadable game is kept (D37). Before this, a single broken question left the
 * Questions step blank on every visit, with no way out of it (fixlist F22).
 */
function setAside(raw, storage, lang) {
  try {
    storage?.setItem(DRAFT_BACKUP_KEY, raw);
    storage?.removeItem(DRAFT_KEY);
  } catch {
    // Storage refused; the next save overwrites the bad draft anyway.
  }
  return newDraft(lang);
}

export function saveDraft(draft, storage = defaultStorage()) {
  try {
    storage?.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

/**
 * A question the setup screens can render. The text and the answer may be empty — the teacher is
 * told at Start — but the type has to be one the icons and labels know, or the page cannot draw it.
 */
const isQuestionShape = (q) =>
  q !== null &&
  typeof q === "object" &&
  !Array.isArray(q) &&
  typeof q.id === "string" &&
  q.id !== "" &&
  QUESTION_TYPES.includes(q.type) &&
  typeof q.text === "string" &&
  typeof q.answer === "string";

function isDraftShape(d) {
  return (
    d !== null &&
    typeof d === "object" &&
    !Array.isArray(d) &&
    Number.isInteger(d.teamCount) &&
    d.teamCount >= LIMITS.teams.min &&
    d.teamCount <= LIMITS.teams.max &&
    Array.isArray(d.teamNames) &&
    d.teamNames.length === LIMITS.teams.max &&
    d.teamNames.every((name) => typeof name === "string") &&
    typeof d.settings === "object" &&
    d.settings !== null &&
    // Number fields may hold null while the teacher is still typing; validateSetup reports those.
    QUESTION_TYPES.every((type) => typeof d.settings.points?.[type] === "object" && d.settings.points[type] !== null) &&
    Array.isArray(d.questions) &&
    d.questions.length <= LIMITS.questions.max &&
    d.questions.every(isQuestionShape) &&
    (d.lang === "uz" || d.lang === "ru")
  );
}

/** Names that will be used: an empty field takes its default ("3-jamoa"). */
export function effectiveTeamNames(draft, defaultName) {
  return draft.teamNames
    .slice(0, draft.teamCount)
    .map((name, i) => name.trim() || defaultName(i + 1));
}

const isWhole = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

/**
 * Setup errors as codes the page turns into text. Empty object = no errors.
 * { team: { [index]: 'teamNameDuplicate' | 'teamNameLong' }, timeSec, extraSec, points: { 'oddiy.correct': ... } }
 */
export function validateSetup(draft, defaultName) {
  const errors = {};
  const names = effectiveTeamNames(draft, defaultName);
  const team = {};
  const seen = new Map();
  names.forEach((name, i) => {
    if (name.length > LIMITS.teamName.max) team[i] = "teamNameLong";
    const key = name.toLocaleLowerCase();
    if (seen.has(key)) {
      team[i] = "teamNameDuplicate";
      team[seen.get(key)] ??= "teamNameDuplicate";
    } else seen.set(key, i);
  });
  if (Object.keys(team).length) errors.team = team;

  const { timeSec, extraSec, points } = draft.settings;
  if (!isWhole(timeSec, LIMITS.timeSec.min, LIMITS.timeSec.max)) errors.timeSec = "timeRange";
  const maxExtra = isWhole(timeSec, LIMITS.timeSec.min, LIMITS.timeSec.max) ? timeSec : LIMITS.timeSec.max;
  if (!isWhole(extraSec, 0, maxExtra)) errors.extraSec = "extraRange";

  const pointErrors = {};
  for (const type of QUESTION_TYPES) {
    for (const field of ["correct", "extra"]) {
      if (!isWhole(points[type][field], 0, POINTS_MAX)) pointErrors[`${type}.${field}`] = "pointsRange";
    }
  }
  if (Object.keys(pointErrors).length) errors.points = pointErrors;
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;

export function newQuestionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Time per question spent outside the clock: reading it out, revealing the answer, judging (D77). */
export const OVERHEAD_SEC = 60;

/**
 * Rough length of a game in whole minutes, rounded up: every question's time plus OVERHEAD_SEC.
 * Null when there are no questions or the time is not a valid number yet (the teacher is typing).
 */
export function estimateMinutes(questionCount, timeSec) {
  if (!questionCount || !Number.isFinite(timeSec) || timeSec <= 0) return null;
  return Math.ceil((questionCount * (timeSec + OVERHEAD_SEC)) / 60);
}
