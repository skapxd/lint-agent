import { confirm, isCancel } from "@clack/prompts";
import { Result, trySafe } from "@skapxd/result";
import type { AdoptionState, PromptStreams } from "#/utils/cli/types";

export async function promptForResumeLastState(
  state: AdoptionState,
  streams: PromptStreams,
) {
  const answer = await trySafe(() =>
    confirm({
      input: streams.input,
      message: `Retomar lote pendiente ${state.percent}% (${state.seed})?`,
      output: streams.output,
    }),
  );

  if (!answer.ok) {
    return Result.err(answer.error);
  }

  if (isCancel(answer.value)) {
    return Result.err(new Error("Interaccion cancelada."));
  }

  return Result.ok(answer.value);
}
