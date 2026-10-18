export function createRun({ runId, config }) {
  return { runId, config, rounds: [], answers: [], scored: [] };
}

export function freezeRunConfig({ runId, roster, categories = ["color"], gameLength = null, objective = "plain", info = { type: "none" }, pipeline = { version: "1.0", policy: "standard" }, components = {} }) {
  return { schema: 1, runId, roster, categories, gameLength, objective, info, pipeline, components };
}

export function appendRawAnswer(run, record) {
  run.answers.push({ schema: 1, runId: run.runId, ...record });
  return run;
}
