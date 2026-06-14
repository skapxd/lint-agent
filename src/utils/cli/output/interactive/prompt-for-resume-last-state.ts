import { Result, trySafe } from "@skapxd/result";
import type { AdoptionState, PromptStreams } from "#/utils/cli/types";

export async function promptForResumeLastState(
  state: AdoptionState,
  streams: PromptStreams,
) {
  const clackPrompts = await trySafe(() => import("@clack/prompts"));

  if (!clackPrompts.ok) {
    return Result.err(clackPrompts.error);
  }

  const { confirm, isCancel } = clackPrompts.value;
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
