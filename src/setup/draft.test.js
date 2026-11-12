import { describe, expect, it } from "vitest";
import { SAMPLE_SETS } from "../game/sampleSets.js";
import {
  DRAFT_BACKUP_KEY,
  DRAFT_KEY,
  estimateMinutes,
  LONG_QUESTION_CHARS,
  effectiveTeamNames,
  hasErrors,
  isLongQuestion,
  loadDraft,
  newDraft,
  validateSetup,
} from "./draft.js";

const name = (n) => `${n}-jamoa`;
const withNames = (names, count = names.length) => {
  const d = newDraft("uz");
  return { ...d, teamCount: count, teamNames: [...names, ...Array(8 - names.length).fill("")] };
};

describe("team names", () => {
  it("fills empty names with the default and ignores teams past the count", () => {
    expect(effectiveTeamNames(withNames(["Burgutlar", " ", "", "Ortiqcha"], 3), name)).toEqual([
      "Burgutlar",
      "2-jamoa",
      "3-jamoa",
    ]);
  });

  it("flags both teams of a duplicate pair, including a typed name equal to a default", () => {
    expect(validateSetup(withNames(["A", "a "]), name).team).toEqual({ 0: "teamNameDuplicate", 1: "teamNameDuplicate" });
    expect(validateSetup(withNames(["2-jamoa", ""]), name).team).toEqual({ 0: "teamNameDuplicate", 1: "teamNameDuplicate" });
  });

  it("flags a name longer than 40 characters", () => {
    expect(validateSetup(withNames(["x".repeat(41), "B"]), name).team).toEqual({ 0: "teamNameLong" });
  });
});

describe("settings", () => {
  const withSettings = (change) => {
    const d = newDraft("uz");
    return { ...d, settings: { ...d.settings, ...change } };
  };

  it("accepts the defaults", () => {
    expect(hasErrors(validateSetup(newDraft("uz"), name))).toBe(false);
  });

  it("checks the time range and whole numbers", () => {
    expect(validateSetup(withSettings({ timeSec: 9 }), name).timeSec).toBe("timeRange");
    expect(validateSetup(withSettings({ timeSec: 601 }), name).timeSec).toBe("timeRange");
    expect(validateSetup(withSettings({ timeSec: null }), name).timeSec).toBe("timeRange");
    expect(validateSetup(withSettings({ timeSec: 30.5 }), name).timeSec).toBe("timeRange");
  });

  it("keeps the extra window within the question time; 0 is allowed", () => {
    expect(validateSetup(withSettings({ timeSec: 30, extraSec: 31 }), name).extraSec).toBe("extraRange");
    expect(validateSetup(withSettings({ timeSec: 30, extraSec: 30 }), name).extraSec).toBeUndefined();
    expect(validateSetup(withSettings({ extraSec: 0 }), name).extraSec).toBeUndefined();
  });

  it("checks every points field", () => {
    const d = newDraft("uz");
    d.settings.points.direktor.extra = 21;
    d.settings.points.oddiy.correct = null;
    expect(validateSetup(d, name).points).toEqual({ "oddiy.correct": "pointsRange", "direktor.extra": "pointsRange" });
  });
});

describe("long questions (F14)", () => {
  it("flags a question past 250 characters, counted without the padding", () => {
    expect(isLongQuestion("x".repeat(250))).toBe(false);
    expect(isLongQuestion("x".repeat(251))).toBe(true);
    expect(isLongQuestion(`  ${"x".repeat(250)}  `)).toBe(false);
    expect(isLongQuestion("")).toBe(false);
    expect(isLongQuestion(undefined)).toBe(false);
    expect(LONG_QUESTION_CHARS).toBe(250);
  });

  it("leaves every sample question unflagged", () => {
    for (const set of Object.values(SAMPLE_SETS)) {
      for (const q of set.questions) expect(isLongQuestion(q.text)).toBe(false);
    }
  });
});

describe("loading the draft", () => {
  const store = (raw) => ({ getItem: (k) => (k === DRAFT_KEY ? raw : null) });
  const memory = (raw) => {
    const data = raw === null ? {} : { [DRAFT_KEY]: raw };
    return {
      data,
      getItem: (k) => (k in data ? data[k] : null),
      setItem: (k, v) => { data[k] = String(v); },
      removeItem: (k) => { delete data[k]; },
    };
  };

  it("starts fresh when nothing is saved or the data is broken", () => {
    expect(loadDraft("ru", store(null))).toEqual(newDraft("ru"));
    expect(loadDraft("uz", memory("{broken"))).toEqual(newDraft("uz"));
    expect(loadDraft("uz", memory(JSON.stringify({ teamCount: 3 })))).toEqual(newDraft("uz"));
  });

  it("returns a saved draft as it was", () => {
    const saved = { ...newDraft("uz"), teamCount: 6, questions: [{ id: "x", type: "oddiy", text: "S", answer: "J" }] };
    expect(loadDraft("ru", store(JSON.stringify(saved)))).toEqual(saved);
    // A half-typed number field holds null until the teacher finishes; that draft is still usable.
    const typing = { ...newDraft("uz"), settings: { ...newDraft("uz").settings, timeSec: null } };
    expect(loadDraft("uz", store(JSON.stringify(typing)))).toEqual(typing);
  });

  // F22 regression: one broken question used to leave the Questions step blank on every visit.
  it("sets aside a draft it cannot draw, instead of handing it to the page", () => {
    const good = { id: "ok", type: "oddiy", text: "Savol", answer: "Javob" };
    const broken = [
      [{ ...good }, { id: "bad", type: "mystery", text: "S", answer: "J" }], // no icon for this type
      [null],
      ["not a question"],
      [{ type: "oddiy", text: "S", answer: "J" }], // no id: React would reuse rows
      [{ id: "bad", type: "oddiy", text: null, answer: "J" }],
      [{ id: "bad", type: "oddiy", text: "S" }],
      Array.from({ length: 31 }, (_, i) => ({ ...good, id: `q${i}` })), // more than a game can hold
    ];
    for (const questions of broken) {
      const raw = JSON.stringify({ ...newDraft("uz"), questions });
      const storage = memory(raw);
      expect(loadDraft("uz", storage)).toEqual(newDraft("uz"));
      expect(storage.data[DRAFT_BACKUP_KEY]).toBe(raw); // nothing is lost silently (D37)
      expect(storage.data[DRAFT_KEY]).toBeUndefined();
    }
  });

  it("sets aside a draft whose own fields are wrong", () => {
    const wrong = [
      { teamCount: 99 },
      { teamCount: 1 },
      { teamNames: ["a", "b"] },
      { teamNames: [1, 2, 3, 4, 5, 6, 7, 8] },
      { lang: "en" },
      { settings: { points: null } },
      { questions: "none" },
    ];
    for (const change of wrong) {
      const raw = JSON.stringify({ ...newDraft("uz"), ...change });
      const storage = memory(raw);
      expect(loadDraft("uz", storage)).toEqual(newDraft("uz"));
      expect(storage.data[DRAFT_BACKUP_KEY]).toBe(raw);
    }
  });

  it("never throws when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error("denied"); } };
    expect(loadDraft("uz", blocked)).toEqual(newDraft("uz"));
    expect(loadDraft("uz", null)).toEqual(newDraft("uz"));
  });
});

describe("estimated game length (D77)", () => {
  it("adds a minute per question to the clock time and rounds up", () => {
    expect(estimateMinutes(10, 60)).toBe(20);
    expect(estimateMinutes(30, 45)).toBe(53); // 30 × 105 s = 52.5 min
    expect(estimateMinutes(1, 10)).toBe(2);
  });

  it("gives nothing without questions or a usable time", () => {
    expect(estimateMinutes(0, 60)).toBe(null);
    expect(estimateMinutes(10, null)).toBe(null);
    expect(estimateMinutes(10, NaN)).toBe(null);
  });
});
