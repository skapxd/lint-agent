import { Result } from "@skapxd/result";
import { runRequestedChangedMode } from "./run-requested-changed-mode";
import { runRequestedEvaluationMode } from "./run-requested-evaluation-mode";
import type { RunRequestedModeInput, SkapxdLintOutput } from "#/utils/cli/types";

export function runRequestedMode(
  input: RunRequestedModeInput,
): Promise<Result<SkapxdLintOutput, unknown>> {
  if (input.changed) {
    return runRequestedChangedMode(input);
  }

  return Promise.resolve(runRequestedEvaluationMode(input));
}
