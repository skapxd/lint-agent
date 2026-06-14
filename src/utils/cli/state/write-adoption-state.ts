import fs from "node:fs";
import path from "node:path";
import { getAdoptionStateFilePath } from "./get-adoption-state-file-path";
import type { AdoptionOutput, AdoptionState } from "#/utils/cli/types";

export function writeAdoptionState(
  targetPath: string,
  adoption: AdoptionOutput,
) {
  const statePath = getAdoptionStateFilePath(targetPath);
  const state: AdoptionState = {
    percent: adoption.percent,
    seed: adoption.seed,
    targetRules: adoption.selectedRules.map((rule) => rule.ruleId),
    timestamp: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

  return statePath;
}
