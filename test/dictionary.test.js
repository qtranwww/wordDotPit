import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_LEXICONS, ENGLISH_WORDS } from "../src/dictionary-data.js";
import { canonicalize, processAnswer } from "../src/pipeline.js";

test("uses the pinned English word list and color lexicon", () => {
  assert.equal(ENGLISH_WORDS.has("turquoise"), true);
  assert.equal(ENGLISH_WORDS.has("asdf"), false);
  assert.equal(CATEGORY_LEXICONS.color.includes("turquoise"), true);
  assert.equal(CATEGORY_LEXICONS.color.includes("lavender"), true);
});

test("dictionary membership is separate from normalization", () => {
  assert.equal(processAnswer("Blue", "color").canonical, "blue");
  assert.equal(processAnswer("turquoise", "color").status, "valid");
  assert.equal(processAnswer("hero", "color").reason, "unverified");
  assert.equal(processAnswer("asdf", "color").reason, "not_a_word");
  assert.equal(processAnswer("foxes", "animal").canonical, "fox");
  assert.equal(canonicalize("grey", "color"), "gray");
});
