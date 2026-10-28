import fs from "node:fs";
import path from "node:path";
import { freezeRunConfig } from "../src/run.js";

const outputPath = process.argv[2] ?? "runs/local/config.json";
const runId = process.argv[3] ?? "local-run";
const provider = process.env.AI_PROVIDER ?? "openrouter";
const model = provider === "openrouter" ? (process.env.OPENROUTER_MODEL ?? "openrouter/free") : (process.env.OPENAI_MODEL ?? "gpt-4o-mini");
const config = freezeRunConfig({
  runId,
  roster: [
    { configId: "real-ai-default", provider, model, temperature: 0, promptVariant: "plain", count: 5 },
    { configId: "simulated-default", provider: "local", model: "handwritten-weighted-list", temperature: null, promptVariant: "none", count: 20 }
  ],
  components: {
    answerPipeline: "1.0",
    collisionRules: "1.0",
    dictionary: "dictionary-0.1",
    englishWordList: "esdb-v2-1e5b7d3a72f47a71da5d28686c1dd4b397178485",
    categoryLexicons: { color: "color-0.1", animal: "animal-seed-1", country: "country-seed-1" }
  }
});
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Wrote frozen run config: ${outputPath}`);
