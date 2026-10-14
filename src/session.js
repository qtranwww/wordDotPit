export function createSession(categories, rosterSize = 20) {
  return { categories: [...categories], rosterSize, roundIndex: 0, rounds: [], totals: new Map() };
}

export function recordRound(session, category, scoredPlayers) {
  const round = { round: session.rounds.length + 1, category, players: scoredPlayers, human: scoredPlayers.find((player) => player.id === "human") ?? null };
  session.rounds.push(round);
  for (const player of scoredPlayers) {
    if (player.collisionPoints != null) session.totals.set(player.id, (session.totals.get(player.id) ?? 0) + player.collisionPoints);
  }
  session.roundIndex = session.rounds.length;
  return round;
}

export function getTotal(session, playerId) { return session.totals.get(playerId) ?? 0; }

export function resetSession(session) {
  session.roundIndex = 0;
  session.rounds.length = 0;
  session.totals.clear();
  return session;
}
