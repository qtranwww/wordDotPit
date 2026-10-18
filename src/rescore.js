import { scoreRound } from "./engine.js";
import { processAnswer } from "./pipeline.js";

export function rescoreAnswers(answerRecords, { policy = "standard", pipelineVersion = "1.0" } = {}) {
  const rounds = new Map();
  for (const record of answerRecords) {
    if (!rounds.has(record.round)) rounds.set(record.round, []);
    rounds.get(record.round).push(record);
  }

  const pipelineId = `pl-${pipelineVersion}-${policy}`;
  const output = [];
  for (const records of rounds.values()) {
    const players = records.map((record) => {
      if (record.error || record.status === "no_response") return { id: record.playerId, status: "no_response" };
      return { id: record.playerId, ...processAnswer(record.rawAnswer, record.category, { policy }) };
    });
    const scored = scoreRound(players);
    const nScored = scored.filter((player) => player.status !== "no_response").length;
    scored.forEach((player, index) => {
      const source = records[index];
      output.push({
        schema: 1,
        runId: source.runId,
        round: source.round,
        category: source.category,
        playerId: player.id,
        pipelineId,
        repaired: player.repaired ?? null,
        canonical: player.canonical ?? null,
        status: player.status,
        reason: player.reason ?? null,
        validationSource: player.validationSource ?? null,
        nScored,
        collisionPoints: player.collisionPoints,
        collisionNorm: nScored > 1 && player.collisionPoints != null ? (player.collisionPoints - 1) / (nScored - 1) : null
      });
    });
  }
  return output;
}
