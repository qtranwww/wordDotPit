import fs from "node:fs";
import path from "node:path";
import { rescoreAnswers } from "../src/rescore.js";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const policy = process.argv[4] ?? "standard";

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/rescore-run.js <answers.jsonl> <scored.jsonl> [strict|standard]");
  process.exit(1);
}

const records = fs.readFileSync(inputPath, "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
const scored = rescoreAnswers(records, { policy });
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${scored.map((record) => JSON.stringify(record)).join("\n")}\n`);
console.log(`Wrote ${scored.length} scored records using policy ${policy}: ${outputPath}`);
