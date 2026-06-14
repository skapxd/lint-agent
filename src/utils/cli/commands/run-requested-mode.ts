import { runRequestedChangedMode } from "./run-requested-changed-mode";
import { runRequestedEvaluationMode } from "./run-requested-evaluation-mode";
import type { RunRequestedModeInput } from "#/utils/cli/types";

export function runRequestedMode(input: RunRequestedModeInput) {
  if (input.changed) {
    return runRequestedChangedMode(input);
  }

  return Promise.resolve(runRequestedEvaluationMode(input));
}
