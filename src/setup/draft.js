// The game being prepared (setup + questions), kept in the browser so a reload or a closed tab
// does not lose 20 typed questions. It stays after the game starts, so the same set can be
// played again with another class; "Clear list" empties it.

import { DEFAULT_SETTINGS, LIMITS, QUESTION_TYPES } from "../game/constants.js";

export const DRAFT_KEY = "zakovat.draft";
export const DEFAULT_TEAM_COUNT = 4;
export const POINTS_MAX = 20;

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
  try {
    const raw = storage?.getItem(DRAFT_KEY);
    if (!raw) return newDraft(lang);
    const draft = JSON.parse(raw);
    return isDraftShape(draft) ? draft : newDraft(lang);
  } catch {
    return newDraft(lang);
  }
}

export function saveDraft(draft, storage = defaultStorage()) {
  try {
    storage?.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function isDraftShape(d) {
  return (
    d !== null &&
    typeof d === "object" &&
    Number.isInteger(d.teamCount) &&
    Array.isArray(d.teamNames) &&
    d.teamNames.length === LIMITS.teams.max &&
    typeof d.settings === "object" &&
    d.settings !== null &&
    QUESTION_TYPES.every((type) => typeof d.settings.points?.[type] === "object") &&
    Array.isArray(d.questions) &&
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
