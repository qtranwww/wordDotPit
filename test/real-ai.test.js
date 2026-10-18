import test from "node:test";
import assert from "node:assert/strict";
import { requestRealAiPlayers } from "../src/real-ai.js";

test("requests five independent real AI players", async () => {
  const requests = [];
  const players = await requestRealAiPlayers({
    count: 5,
    fetcher: async (_url, options) => {
      requests.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ status: "received", raw_answer: "blue", latency_ms: 10 }) };
    }
  });
  assert.equal(players.length, 5);
  assert.deepEqual(players.map((player) => player.id), ["real-ai-001", "real-ai-002", "real-ai-003", "real-ai-004", "real-ai-005"]);
  assert.equal(new Set(requests.map((request) => request.player_id)).size, 5);
});

test("keeps a failed real AI as no_response", async () => {
  const players = await requestRealAiPlayers({
    count: 1,
    fetcher: async () => ({ ok: false, status: 429, json: async () => ({}) })
  });
  assert.equal(players[0].status, "no_response");
  assert.equal(players[0].error, "http_429");
});
