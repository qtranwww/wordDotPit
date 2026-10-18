import { processAnswer } from "./pipeline.js";

export async function requestRealAiPlayers({ fetcher = fetch, category = "color", count = 5, concurrency = 5, onProgress = () => {} } = {}) {
  const players = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < count) {
      const index = nextIndex++;
      const playerId = `real-ai-${String(index + 1).padStart(3, "0")}`;
      try {
        const response = await fetcher("/api/ai-answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, player_id: playerId }) });
        if (!response.ok) {
          players[index] = { id: playerId, status: "no_response", answer: "", error: `http_${response.status}` };
        } else {
          const result = await response.json();
          if (result.status !== "received") {
            players[index] = { id: playerId, status: "no_response", answer: "", error: result.error };
          } else {
            const pipeline = processAnswer(result.raw_answer, category);
            players[index] = { id: playerId, answer: result.raw_answer, canonical: pipeline.canonical, status: pipeline.status, pipeline, latencyMs: result.latency_ms };
          }
        }
      } catch (error) {
        players[index] = { id: playerId, status: "no_response", answer: "", error: error.name };
      }
      onProgress(players.filter(Boolean).length, count, players[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, count) }, () => worker()));
  return players;
}
