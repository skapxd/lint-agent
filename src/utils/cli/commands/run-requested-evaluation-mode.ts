import { trySafe } from "@skapxd/result";
import { createAdoptionOutput } from "#/utils/cli/adoption/create-adoption-output";
import { createVerificationOutput } from "#/utils/cli/adoption/create-verification-output";
import { createExecutionErrorOutput } from "#/utils/cli/output/machine/create-execution-error-output";
import { runEphemeralEvaluation } from "./run-ephemeral-evaluation";
import type { RunRequestedModeInput } from "#/utils/cli/types";

export function runRequestedEvaluationMode(input: RunRequestedModeInput) {
  const evaluationOutput = trySafe(() =>
    runEphemeralEvaluation(input.path, input.preset, input.includeTests),
  );

  if (!evaluationOutput.ok) {
    const message =
      evaluationOutput.error instanceof Error
        ? evaluationOutput.error.message
        : "fallo desconocido";

    return createExecutionErrorOutput(message);
  }

  if (input.verifySeed !== null) {
    return createVerificationOutput(evaluationOutput.value, input.verifySeed);
  }

  if (input.adoptPercent !== null) {
    return createAdoptionOutput(evaluationOutput.value, input.adoptPercent);
  }

  return evaluationOutput.value;
}
