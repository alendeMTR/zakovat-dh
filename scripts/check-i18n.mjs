// UI text check (CLAUDE.md §4, docs/decisionlog.md D21). Fails when:
//   - a key exists in one language and not the other;
//   - a value is empty or not a string;
//   - Uzbek text uses ʻ ʼ ‘ ’ where the ASCII apostrophe belongs;
//   - code calls t("key") with a key that no dictionary has.
// Dev-only screens under src/dev/ are not user-facing and are skipped.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const load = async (lang) =>
  (await import(pathToFileURL(join(root, "src", "i18n", `${lang}.js`)).href)).default;

const dicts = { uz: await load("uz"), ru: await load("ru") };
const problems = [];

const allKeys = new Set([...Object.keys(dicts.uz), ...Object.keys(dicts.ru)]);
for (const key of allKeys) {
  for (const [lang, dict] of Object.entries(dicts)) {
    if (!(key in dict)) problems.push(`${lang}: missing key "${key}"`);
    else if (typeof dict[key] !== "string" || dict[key].trim() === "")
      problems.push(`${lang}: empty value for "${key}"`);
  }
}

const BAD_APOSTROPHE = /[ʻʼ‘’]/;
for (const [key, value] of Object.entries(dicts.uz)) {
  if (typeof value === "string" && BAD_APOSTROPHE.test(value))
    problems.push(`uz: "${key}" uses a non-ASCII apostrophe: ${value}`);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "dev" ? [] : walk(full);
    return /\.(js|jsx)$/.test(entry.name) && !/\.test\.js$/.test(entry.name) ? [full] : [];
  });

const CALL = /\bt\(\s*["']([^"']+)["']/g;
for (const file of walk(join(root, "src"))) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(CALL)) {
    if (!allKeys.has(match[1])) {
      const line = text.slice(0, match.index).split("\n").length;
      problems.push(`${relative(root, file)}:${line} uses unknown key "${match[1]}"`);
    }
  }
}

if (problems.length) {
  console.error(problems.map((p) => `FAIL ${p}`).join("\n"));
  console.error(`check-i18n: ${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`check-i18n: ${allKeys.size} keys, uz and ru match, no problems.`);
