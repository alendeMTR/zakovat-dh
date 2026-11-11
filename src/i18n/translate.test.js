import { describe, expect, it } from "vitest";
import { fill, translate } from "./translate.js";

describe("translate", () => {
  it("returns the text for the language", () => {
    expect(translate("uz", "home.newGame")).toBe("Yangi o'yin");
    expect(translate("ru", "home.newGame")).toBe("Новая игра");
  });

  it("falls back to Uzbek for an unknown language", () => {
    expect(translate("en", "home.newGame")).toBe("Yangi o'yin");
  });

  it("returns the key when it is missing", () => {
    expect(translate("uz", "no.such.key")).toBe("no.such.key");
  });

  it("fills placeholders and leaves unknown ones in place", () => {
    expect(fill("{n} ta savol, {m}", { n: 10 })).toBe("10 ta savol, {m}");
    expect(fill("{n} / {total}", { n: 0, total: 30 })).toBe("0 / 30");
  });

  it("does not take placeholder values from the object prototype", () => {
    expect(fill("{toString}", {})).toBe("{toString}");
  });
});
