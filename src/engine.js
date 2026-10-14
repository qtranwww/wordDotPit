export function scoreRound(players) {
  const scored = players.filter((player) => player.status !== "no_response");
  const n = scored.length;
  const counts = new Map();

  for (const player of scored) {
    if (player.status === "valid") {
      counts.set(player.canonical, (counts.get(player.canonical) ?? 0) + 1);
    }
  }

  return players.map((player) => {
    if (player.status === "no_response") {
      return { ...player, collisionPoints: null };
    }
    if (player.status !== "valid") {
      return { ...player, collisionPoints: n };
    }
    return { ...player, collisionPoints: counts.get(player.canonical) };
  });
}

