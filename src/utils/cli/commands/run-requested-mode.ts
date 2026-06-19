import { Result } from "@skapxd/result";
import { runRequestedChangedMode } from "./run-requested-changed-mode";
import { runRequestedEvaluationMode } from "./run-requested-evaluation-mode";
import type {
  CliExecutionError,
  RunRequestedModeInput,
  SkapxdLintOutput,
} from "#/utils/cli/types";

export async function runRequestedMode(
  input: RunRequestedModeInput,
): Promise<Result<SkapxdLintOutput, CliExecutionError>> {
  if (input.changed) {
    return runRequestedChangedMode(input);
  }

  return runRequestedEvaluationMode(input);
}
