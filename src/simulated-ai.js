const WORDS = {
  color: ["blue", "green", "red", "cyan", "gray", "purple"],
  animal: ["dog", "cat", "dolphin", "mouse", "wolf", "pangolin"],
  country: ["canada", "japan", "brazil", "kenya", "nepal", "iceland"]
};

export function createSimulatedPlayers(category, count, random = Math.random) {
  const words = WORDS[category] ?? [];
  return Array.from({ length: count }, (_, index) => {
    const word = words[Math.floor(random() * words.length)];
    return { id: `ai-${String(index + 1).padStart(3, "0")}`, status: "valid", canonical: word, answer: word };
  });
}

