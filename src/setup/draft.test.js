import { describe, expect, it } from "vitest";
import { DRAFT_KEY, effectiveTeamNames, hasErrors, loadDraft, newDraft, validateSetup } from "./draft.js";

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

describe("loading the draft", () => {
  const store = (raw) => ({ getItem: (k) => (k === DRAFT_KEY ? raw : null) });

  it("starts fresh when nothing is saved or the data is broken", () => {
    expect(loadDraft("ru", store(null))).toEqual(newDraft("ru"));
    expect(loadDraft("uz", store("{broken"))).toEqual(newDraft("uz"));
    expect(loadDraft("uz", store(JSON.stringify({ teamCount: 3 })))).toEqual(newDraft("uz"));
  });

  it("returns a saved draft as it was", () => {
    const saved = { ...newDraft("uz"), teamCount: 6, questions: [{ id: "x", type: "oddiy", text: "S", answer: "J" }] };
    expect(loadDraft("ru", store(JSON.stringify(saved)))).toEqual(saved);
  });
});
