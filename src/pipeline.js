import { CATEGORY_LEXICONS, ENGLISH_WORDS } from "./dictionary-data.js";

const CATEGORY_SETS = Object.fromEntries(Object.entries(CATEGORY_LEXICONS).map(([category, words]) => [category, new Set(words)]));

const ALIASES = new Map([["grey", "gray"], ["mice", "mouse"]]);
const NO_SINGULARIZE = new Set(["news", "species", "series"]);

export function repairAnswer(rawAnswer) {
  if (rawAnswer == null) return "";
  return rawAnswer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/^["'([\{]+|["'.,;:!?\])\}]+$/g, "").toLowerCase();
}

function isEnglishWord(word) {
  return ENGLISH_WORDS.has(word);
}

export function canonicalize(word, category, policy = "standard") {
  const lexicon = CATEGORY_SETS[category] ?? new Set();
  if (lexicon.has(word)) return word;
  if (policy === "strict") return word;
  if (ALIASES.has(word)) return ALIASES.get(word);
  if (!NO_SINGULARIZE.has(word)) {
    const candidates = [];
    if (word.endsWith("ies")) candidates.push(`${word.slice(0, -3)}y`);
    if (word.endsWith("ves")) candidates.push(`${word.slice(0, -3)}f`, `${word.slice(0, -3)}fe`);
    if (word.endsWith("es")) candidates.push(word.slice(0, -2));
    if (word.endsWith("s")) candidates.push(word.slice(0, -1));
    const categoryCandidate = candidates.find((candidate) => lexicon.has(candidate));
    if (categoryCandidate) return categoryCandidate;
    const wordListCandidate = candidates.find(isEnglishWord);
    if (wordListCandidate) return wordListCandidate;
  }
  return word;
}

export function processAnswer(rawAnswer, category, { phase = "before-8", decisions = new Map(), policy = "standard" } = {}) {
  const repaired = repairAnswer(rawAnswer);
  if (!repaired) return { raw: rawAnswer ?? "", repaired, canonical: null, status: "invalid", reason: "empty" };
  if (!/^[a-z]{1,45}$/.test(repaired)) return { raw: rawAnswer, repaired, canonical: null, status: "invalid", reason: "format" };
  if (!isEnglishWord(repaired)) return { raw: rawAnswer, repaired, canonical: null, status: "invalid", reason: "not_a_word" };
  const canonical = canonicalize(repaired, category, policy);
  const lexicon = CATEGORY_SETS[category] ?? new Set();
  if (lexicon.has(canonical)) return { raw: rawAnswer, repaired, canonical, status: "valid", reason: null, validationSource: "lexicon" };
  const decision = decisions.get(`${category}:${canonical}`);
  if (decision === "member") return { raw: rawAnswer, repaired, canonical, status: "valid", reason: null, validationSource: "cache" };
  if (decision === "non_member") return { raw: rawAnswer, repaired, canonical, status: "invalid", reason: "not_in_category", validationSource: "cache" };
  return { raw: rawAnswer, repaired, canonical, status: "invalid", reason: phase === "before-8" ? "unverified" : "not_in_category", validationSource: "unknown" };
}
