import test from "node:test";
import assert from "node:assert/strict";
import { createSession, getTotal, recordRound, resetSession } from "../src/session.js";

test("records each round and accumulates player points", () => {
  const session = createSession(["animal", "color"]);
  recordRound(session, "animal", [{ id: "human", collisionPoints: 2 }]);
  recordRound(session, "color", [{ id: "human", collisionPoints: 1 }]);
  assert.equal(session.rounds.length, 2);
  assert.equal(getTotal(session, "human"), 3);
});

test("reset starts a clean session", () => {
  const session = createSession(["animal"]);
  recordRound(session, "animal", [{ id: "human", collisionPoints: 2 }]);
  resetSession(session);
  assert.equal(session.rounds.length, 0);
  assert.equal(session.roundIndex, 0);
  assert.equal(getTotal(session, "human"), 0);
});
