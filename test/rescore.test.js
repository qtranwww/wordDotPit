import test from "node:test";
import assert from "node:assert/strict";
import { rescoreAnswers } from "../src/rescore.js";
import { freezeRunConfig } from "../src/run.js";

const answers = [
  { runId: "r001", round: 1, category: "color", playerId: "human", rawAnswer: "grey" },
  { runId: "r001", round: 1, category: "color", playerId: "ai-001", rawAnswer: "gray" }
];

test("re-scoring is deterministic and tagged", () => {
  const first = rescoreAnswers(answers, { policy: "standard" });
  assert.deepEqual(first, rescoreAnswers(answers, { policy: "standard" }));
  assert.equal(first[0].pipelineId, "pl-1.0-standard");
  assert.deepEqual(first.map((record) => record.collisionPoints), [2, 2]);
});

test("strict and standard policies differ", () => {
  const strict = rescoreAnswers(answers, { policy: "strict" });
  const standard = rescoreAnswers(answers, { policy: "standard" });
  assert.equal(strict[0].status, "invalid");
  assert.equal(standard[0].status, "valid");
});

test("run config records roster and component versions", () => {
  const config = freezeRunConfig({ runId: "r001", roster: [{ configId: "cfgA", count: 5 }] });
  assert.equal(config.schema, 1);
  assert.equal(config.runId, "r001");
  assert.equal(config.roster[0].configId, "cfgA");
});
