import { Result } from "@skapxd/result";
import { promptForResumeLastState } from "#/utils/cli/output/interactive/prompt-for-resume-last-state";
import { readAdoptionState } from "./read-adoption-state";
import type { CliArguments, PromptStreams } from "#/utils/cli/types";

type ResolveStateBackedVerifySeedInput = {
  cliArguments: CliArguments;
  interactive: boolean;
  path: string;
  streams: PromptStreams;
};

export async function resolveStateBackedVerifySeed(
  input: ResolveStateBackedVerifySeedInput,
) {
  if (input.cliArguments.verifySeed !== null) {
    return Result.ok(input.cliArguments.verifySeed);
  }

  const shouldResumeLast = input.cliArguments.resumeLast;

  if (shouldResumeLast) {
    const storedState = readAdoptionState(input.path);
    const hasStoredState = storedState !== null;

    return hasStoredState
      ? Result.ok(storedState.state.seed)
      : Result.err(
          new Error(
            "No hay lote persistido para --resume-last. Ejecuta --adopt <percent> primero o pasa --verify <seed>.",
          ),
        );
  }

  const shouldOfferStoredState =
    input.interactive &&
    input.cliArguments.adoptPercent === null &&
    !input.cliArguments.changed;

  if (!shouldOfferStoredState) {
    return Result.ok(null);
  }

  const storedState = readAdoptionState(input.path);
  const hasStoredState = storedState !== null;

  if (!hasStoredState) {
    return Result.ok(null);
  }

  const resumeResult = await promptForResumeLastState(
    storedState.state,
    input.streams,
  );

  if (!resumeResult.ok) {
    return Result.err(resumeResult.error);
  }

  if (resumeResult.value) {
    return Result.ok(storedState.state.seed);
  }

  return Result.ok(null);
}
