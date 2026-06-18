import { Result } from "@skapxd/result";
import { createExecutionErrorOutput } from "#/utils/cli/output/machine/create-execution-error-output";
import { runChangedMode } from "./run-changed-mode";
import { getUnknownErrorMessage } from "#/utils/unknown/get-unknown-error-message";
import type { RunRequestedModeInput, SkapxdLintOutput } from "#/utils/cli/types";

export async function runRequestedChangedMode(
  input: RunRequestedModeInput,
): Promise<Result<SkapxdLintOutput, unknown>> {
  const changedOutput = await runChangedMode(input.base, input.streams.cwd);

  if (!changedOutput.ok) {
    const message = getUnknownErrorMessage(changedOutput.error, "fallo desconocido");

    return Result.ok(createExecutionErrorOutput(message, "changed"));
  }

  return changedOutput;
}
