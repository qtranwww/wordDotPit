import test from "node:test";
import assert from "node:assert/strict";
import { scoreRound } from "../src/engine.js";

test("unique and shared valid answers receive collision points", () => {
  const result = scoreRound([
    { id: "human", status: "valid", canonical: "dolphin" },
    { id: "ai-1", status: "valid", canonical: "dolphin" },
    { id: "ai-2", status: "valid", canonical: "pangolin" }
  ]);
  assert.deepEqual(result.map((player) => player.collisionPoints), [2, 2, 1]);
});

test("invalid answers score N and do not collide", () => {
  const result = scoreRound([
    { id: "a", status: "invalid", canonical: "same" },
    { id: "b", status: "invalid", canonical: "same" },
    { id: "c", status: "valid", canonical: "cat" }
  ]);
  assert.deepEqual(result.map((player) => player.collisionPoints), [3, 3, 1]);
});

test("no_response is excluded from N", () => {
  const result = scoreRound([
    { id: "a", status: "valid", canonical: "cat" },
    { id: "b", status: "no_response" },
    { id: "c", status: "invalid" }
  ]);
  assert.deepEqual(result.map((player) => player.collisionPoints), [1, null, 2]);
});

