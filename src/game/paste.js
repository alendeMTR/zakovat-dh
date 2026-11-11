// Paste import (D19). A teacher can write this in Word or get it from any chatbot.
//
//   Oddiy: Qaysi ko'l eng chuqur?
//   Javob: Baykal
//
//   Sandiqcha: Har bir o'zbekda bor.
//   Javob: Taroq
//
// Blocks are separated by blank lines. The type prefix is optional (no prefix = Oddiy savol) and may
// stand on its own line. Numbering such as "1." or "2)" is ignored. Type names and the answer label
// are accepted in Uzbek (Latin and Cyrillic), Russian and English.

import { LIMITS } from "./constants.js";

const TYPE_WORDS = {
  oddiy: ["oddiy savol", "oddiy", "оддий савол", "оддий", "обычный вопрос", "обычный", "простой вопрос", "простой", "ordinary", "regular"],
  direktor: ["direktor savoli", "direktor", "директор саволи", "вопрос директора", "директорский вопрос", "директор", "director"],
  sandiqcha: [
    "zakovat sandiqchasi", "sandiqchasi", "sandiqcha", "sandiq",
    "заковат сандиқчаси", "заковат сандикчаси", "сандиқча", "сандикча",
    "чёрный ящик", "черный ящик", "ящик", "box",
  ],
};
const ANSWER_WORDS = ["javob", "жавоб", "ответ", "answer"];
const SEP = String.raw`\s*[:.\-–—]\s*`;

const byLength = (a, b) => b.length - a.length;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TYPE_PREFIX = new RegExp(
  `^(${Object.values(TYPE_WORDS).flat().sort(byLength).map(escape).join("|")})${SEP}(.*)$`,
  "iu",
);
const TYPE_ONLY = new RegExp(`^(${Object.values(TYPE_WORDS).flat().sort(byLength).map(escape).join("|")})\\s*[:.]?$`, "iu");
const ANSWER_PREFIX = new RegExp(`^(${ANSWER_WORDS.map(escape).join("|")})${SEP}(.*)$`, "iu");
const NUMBERING = /^\s*\d{1,2}\s*[.)]\s*/u;

const typeOf = (word) =>
  Object.keys(TYPE_WORDS).find((type) => TYPE_WORDS[type].includes(word.toLocaleLowerCase()));

/** Uzbek uses the ASCII apostrophe (D21): ʻ ʼ ‘ ’ ` ´ become '. */
export function normalizeUz(text) {
  return text.replace(/[ʻʼ‘’`´]/g, "'");
}

/**
 * Returns { questions, errors }. Each error is { line, code } with code one of
 * 'noQuestion', 'noAnswer', 'emptyAnswer', 'tooMany' (line is null for 'tooMany').
 * Questions come back even when some blocks have errors, so the teacher fixes only the bad ones.
 */
export function parsePaste(raw, { lang = "uz" } = {}) {
  const text = lang === "uz" ? normalizeUz(raw) : raw;
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const questions = [];
  const errors = [];

  let block = [];
  const flush = () => {
    if (block.length) parseBlock(block, questions, errors);
    block = [];
  };
  lines.forEach((line, i) => {
    if (line.trim() === "") flush();
    else block.push({ text: line.trim(), line: i + 1 });
  });
  flush();

  if (questions.length > LIMITS.questions.max) errors.push({ line: null, code: "tooMany" });
  return { questions, errors };
}

function parseBlock(block, questions, errors) {
  const firstLine = block[0].line;
  let type = "oddiy";
  const questionLines = [];
  const answerLines = [];
  let inAnswer = false;

  block.forEach(({ text }, index) => {
    let rest = index === 0 ? text.replace(NUMBERING, "") : text;
    if (inAnswer) {
      answerLines.push(rest);
      return;
    }
    const answer = rest.match(ANSWER_PREFIX);
    if (answer) {
      inAnswer = true;
      if (answer[2].trim()) answerLines.push(answer[2].trim());
      return;
    }
    if (index === 0) {
      const only = rest.match(TYPE_ONLY);
      if (only) {
        type = typeOf(only[1]);
        return;
      }
      const prefixed = rest.match(TYPE_PREFIX);
      if (prefixed) {
        type = typeOf(prefixed[1]);
        rest = prefixed[2].trim();
      }
    }
    if (rest) questionLines.push(rest);
  });

  if (questionLines.length === 0) return errors.push({ line: firstLine, code: "noQuestion" });
  if (!inAnswer) return errors.push({ line: firstLine, code: "noAnswer" });
  if (answerLines.length === 0) return errors.push({ line: firstLine, code: "emptyAnswer" });

  questions.push({
    id: `p${questions.length + 1}`,
    type,
    text: questionLines.join("\n"),
    answer: answerLines.join(" "),
  });
}

const LABELS = {
  uz: { oddiy: "Oddiy", direktor: "Direktor", sandiqcha: "Sandiqcha", answer: "Javob" },
  ru: { oddiy: "Обычный", direktor: "Директор", sandiqcha: "Ящик", answer: "Ответ" },
};

/** The reverse of parsePaste: a set as text a teacher can copy, edit and paste back. */
export function formatPaste(questions, lang = "uz") {
  const labels = LABELS[lang] ?? LABELS.uz;
  return questions
    .map((q) => `${labels[q.type]}: ${q.text}\n${labels.answer}: ${q.answer}`)
    .join("\n\n");
}
