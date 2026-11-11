import { describe, expect, it } from "vitest";
import { createGame } from "./game.js";
import { formatPaste, normalizeUz, parsePaste } from "./paste.js";
import { SAMPLE_SETS } from "./sampleSets.js";

const strip = (questions) => questions.map(({ type, text, answer }) => ({ type, text, answer }));

describe("parsePaste", () => {
  it("reads typed blocks separated by blank lines", () => {
    const { questions, errors } = parsePaste(
      "Oddiy: Eng chuqur ko'l qaysi?\nJavob: Baykal\n\n\nSandiqcha: Har bir o'zbekda bor.\nJavob: Taroq",
    );
    expect(errors).toEqual([]);
    expect(strip(questions)).toEqual([
      { type: "oddiy", text: "Eng chuqur ko'l qaysi?", answer: "Baykal" },
      { type: "sandiqcha", text: "Har bir o'zbekda bor.", answer: "Taroq" },
    ]);
  });

  it("treats a block without a type as Oddiy savol", () => {
    const { questions } = parsePaste("Qaysi sayyora eng katta?\nJavob: Yupiter");
    expect(questions[0].type).toBe("oddiy");
  });

  it("accepts the type on its own line, numbering, long type names and multi-line text", () => {
    const { questions, errors } = parsePaste(
      "1. Zakovat sandiqchasi:\nKal o'g'rilar uyga tushishdi.\nBitta buyumni qoldirishdi.\nJavob: Taroq\n\n2) Direktor savoli - Xamsa nechta dostondan iborat?\nJavob: Beshta",
    );
    expect(errors).toEqual([]);
    expect(strip(questions)).toEqual([
      { type: "sandiqcha", text: "Kal o'g'rilar uyga tushishdi.\nBitta buyumni qoldirishdi.", answer: "Taroq" },
      { type: "direktor", text: "Xamsa nechta dostondan iborat?", answer: "Beshta" },
    ]);
  });

  it("reads Russian and Cyrillic Uzbek labels, any letter case", () => {
    const ru = parsePaste("ЧЁРНЫЙ ЯЩИК: У неё есть головка.\nОТВЕТ: Спичка", { lang: "ru" });
    expect(strip(ru.questions)).toEqual([{ type: "sandiqcha", text: "У неё есть головка.", answer: "Спичка" }]);
    const uzCyr = parsePaste("Директор: Савол\nЖавоб: Жавоб матни");
    expect(uzCyr.questions[0]).toMatchObject({ type: "direktor", answer: "Жавоб матни" });
  });

  it("keeps a colon inside question text when the word before it is not a type", () => {
    const { questions } = parsePaste("Diqqat: bu savol uzun.\nJavob: Ha");
    expect(questions[0]).toMatchObject({ type: "oddiy", text: "Diqqat: bu savol uzun." });
  });

  it("joins answer lines that follow the answer label", () => {
    const { questions } = parsePaste("Savol?\nJavob:\nBirinchi qator\nikkinchi qator");
    expect(questions[0].answer).toBe("Birinchi qator ikkinchi qator");
  });

  it("normalises Uzbek apostrophes to ASCII, and leaves Russian text alone (D21)", () => {
    const { questions } = parsePaste("O‘zbekiston poytaxti? Gʻarb emas.\nJavob: Toshkent’");
    expect(questions[0].text).toBe("O'zbekiston poytaxti? G'arb emas.");
    expect(questions[0].answer).toBe("Toshkent'");
    const ru = parsePaste("Слово ’тест’?\nОтвет: да", { lang: "ru" });
    expect(ru.questions[0].text).toBe("Слово ’тест’?");
    expect(normalizeUz("ʻʼ‘’`´")).toBe("''''''");
  });

  it("handles Windows line endings", () => {
    const { questions, errors } = parsePaste("Oddiy: A?\r\nJavob: B\r\n\r\nOddiy: C?\r\nJavob: D");
    expect(errors).toEqual([]);
    expect(questions.map((q) => q.answer)).toEqual(["B", "D"]);
  });

  it("reports each broken block with its first line, and keeps the good ones", () => {
    const { questions, errors } = parsePaste(
      "Oddiy: Javobsiz savol\n\nJavob: Savolsiz javob\n\nSavol?\nJavob:\n\nYaxshi savol?\nJavob: Ha",
    );
    expect(errors).toEqual([
      { line: 1, code: "noAnswer" },
      { line: 3, code: "noQuestion" },
      { line: 5, code: "emptyAnswer" },
    ]);
    expect(questions.map((q) => q.text)).toEqual(["Yaxshi savol?"]);
  });

  it("flags more than 30 questions but still returns them", () => {
    const text = Array.from({ length: 31 }, (_, i) => `Savol ${i + 1}?\nJavob: ${i + 1}`).join("\n\n");
    const { questions, errors } = parsePaste(text);
    expect(questions).toHaveLength(31);
    expect(errors).toEqual([{ line: null, code: "tooMany" }]);
  });

  it("returns nothing for empty input", () => {
    expect(parsePaste("  \n\n ")).toEqual({ questions: [], errors: [] });
  });
});

describe("formatPaste", () => {
  for (const lang of ["uz", "ru"]) {
    it(`round-trips the ${lang} sample set through text`, () => {
      const set = SAMPLE_SETS[lang];
      const { questions, errors } = parsePaste(formatPaste(set.questions, lang), { lang });
      expect(errors).toEqual([]);
      expect(strip(questions)).toEqual(strip(set.questions));
      // And the parsed set starts a game.
      expect(() => createGame({ teamNames: ["A", "B"], questions, lang, now: 0 })).not.toThrow();
    });
  }
});

// F24 regression: the type lookup must not depend on the device's locale. On a Turkish or
// Azerbaijani machine "DIREKTOR".toLocaleLowerCase() is "dırektor" with a dotless i, which is not
// a type name, so the question used to come back with no type at all and blank the questions page.
describe("type names on a device with Turkish case rules", () => {
  const withTurkishLocale = (run) => {
    const real = String.prototype.toLocaleLowerCase;
    String.prototype.toLocaleLowerCase = function turkish(...args) {
      return real.call(this, args.length > 0 ? args[0] : "tr");
    };
    try {
      return run();
    } finally {
      String.prototype.toLocaleLowerCase = real;
    }
  };

  it("still reads an upper-case type name", () => {
    expect("DIREKTOR".toLocaleLowerCase("tr")).toBe("dırektor"); // the mechanism, spelled out
    withTurkishLocale(() => {
      for (const [word, type] of [
        ["DIREKTOR", "direktor"],
        ["ODDIY", "oddiy"],
        ["SANDIQCHA", "sandiqcha"],
        ["ORDINARY", "oddiy"],
        ["DIRECTOR", "direktor"],
      ]) {
        const { questions, errors } = parsePaste(`${word}: Savol?\nJavob: Javob`);
        expect(errors).toEqual([]);
        expect(questions[0].type).toBe(type);
      }
      // A type word on its own line takes the same path.
      const { questions } = parsePaste("DIREKTOR\nSavol?\nJavob: Javob");
      expect(questions[0].type).toBe("direktor");
    });
  });
});
