import { trySafe } from "@skapxd/result";
import { createExecutionErrorOutput } from "./create-execution-error-output";
import { runChangedMode } from "./run-changed-mode";
import type { RunRequestedModeInput } from "./types";

export async function runRequestedChangedMode(input: RunRequestedModeInput) {
  const changedOutput = await trySafe(() =>
    runChangedMode(input.base, input.streams.cwd),
  );

  if (!changedOutput.ok) {
    const message =
      changedOutput.error instanceof Error
        ? changedOutput.error.message
        : "fallo desconocido";

    return createExecutionErrorOutput(message, "changed");
  }

  return changedOutput.value;
}
