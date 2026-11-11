import uz from "./uz.js";
import ru from "./ru.js";

export const DICTIONARIES = { uz, ru };
export const LANGUAGES = ["uz", "ru"];
export const DEFAULT_LANGUAGE = "uz";

/**
 * Looks up `key` in the language's dictionary and fills {placeholders} from `vars`.
 * A missing key returns the key itself, so a gap shows on screen instead of an empty space
 * (npm run check:i18n catches it before that).
 */
export function translate(lang, key, vars) {
  const dict = DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANGUAGE];
  const text = dict[key];
  if (typeof text !== "string") return key;
  return vars ? fill(text, vars) : text;
}

/** Replaces each {name} with vars[name]; a placeholder without a value stays as written. */
export function fill(text, vars) {
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  );
}
