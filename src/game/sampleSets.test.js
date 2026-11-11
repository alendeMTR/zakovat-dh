import { describe, expect, it } from "vitest";
import { createGame } from "./game.js";
import { SAMPLE_SETS } from "./sampleSets.js";

describe.each(["uz", "ru"])("sample set %s", (lang) => {
  const set = SAMPLE_SETS[lang];

  it("has 10 questions: 7 Oddiy, 1 Direktor, 2 Sandiqcha", () => {
    const count = (type) => set.questions.filter((q) => q.type === type).length;
    expect(set.questions).toHaveLength(10);
    expect([count("oddiy"), count("direktor"), count("sandiqcha")]).toEqual([7, 1, 2]);
  });

  it("has unique ids, its own language, and no empty text", () => {
    expect(new Set(set.questions.map((q) => q.id)).size).toBe(10);
    expect(set.lang).toBe(lang);
    for (const q of set.questions) {
      expect(q.text.trim()).not.toBe("");
      expect(q.answer.trim()).not.toBe("");
    }
  });

  it("starts a game", () => {
    expect(() => createGame({ teamNames: ["A", "B"], questions: set.questions, lang, now: 0 })).not.toThrow();
  });
});

it("uses only the ASCII apostrophe in Uzbek (D21)", () => {
  const text = JSON.stringify(SAMPLE_SETS.uz);
  expect(text).not.toMatch(/[ʻʼ‘’]/);
});
