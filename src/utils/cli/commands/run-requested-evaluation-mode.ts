import { Result } from "@skapxd/result";
import { createAdoptionOutput } from "#/utils/cli/adoption/create-adoption-output";
import { createVerificationOutput } from "#/utils/cli/adoption/create-verification-output";
import { createExecutionErrorOutput } from "#/utils/cli/output/machine/create-execution-error-output";
import { runEphemeralEvaluation } from "./run-ephemeral-evaluation";
import { getUnknownErrorMessage } from "#/utils/unknown/get-unknown-error-message";
import type { RunRequestedModeInput, SkapxdLintOutput } from "#/utils/cli/types";

export function runRequestedEvaluationMode(
  input: RunRequestedModeInput,
): Result<SkapxdLintOutput, unknown> {
  const evaluationOutput = runEphemeralEvaluation(
    input.path,
    input.preset,
    input.includeTests,
    input.useProjectTsconfig,
  );

  if (!evaluationOutput.ok) {
    const message = getUnknownErrorMessage(evaluationOutput.error, "fallo desconocido");

    return Result.ok(createExecutionErrorOutput(message));
  }

  if (input.verifySeed !== null) {
    return Result.ok(createVerificationOutput(evaluationOutput.value, input.verifySeed));
  }

  if (input.adoptPercent !== null) {
    return Result.ok(createAdoptionOutput(evaluationOutput.value, input.adoptPercent));
  }

  return evaluationOutput;
}
