import test from "node:test";
import assert from "node:assert/strict";
import { processAnswer } from "../src/pipeline.js";

test("repairs and canonicalizes case, punctuation, accents, and plurals", () => {
  assert.equal(processAnswer("MiCE", "animal").canonical, "mouse");
  assert.equal(processAnswer("dogs", "animal").canonical, "dog");
  assert.equal(processAnswer("dolphin!", "animal").status, "valid");
  assert.equal(processAnswer("café", "color").repaired, "cafe");
});

test("rejects malformed and non-word answers with specific reasons", () => {
  assert.equal(processAnswer("", "color").reason, "empty");
  assert.equal(processAnswer("light blue", "color").reason, "format");
  assert.equal(processAnswer("sky-blue", "color").reason, "format");
  assert.equal(processAnswer("asdf", "animal").reason, "not_a_word");
});

test("keeps distinct colors distinct and marks unknown words", () => {
  assert.notEqual(processAnswer("blue", "color").canonical, processAnswer("cyan", "color").canonical);
  assert.equal(processAnswer("hero", "color").reason, "unverified");
  assert.equal(processAnswer("hero", "color", { phase: "after-8" }).reason, "not_in_category");
});

