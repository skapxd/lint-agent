import { Result, trySafe } from "@skapxd/result";
import type {
  AdoptionState,
  CliIoError,
  PromptStreams,
} from "#/utils/cli/types";

export async function promptForResumeLastState(
  state: AdoptionState,
  streams: PromptStreams,
): Promise<Result<boolean, CliIoError>> {
  const clackPrompts = await trySafe(() => import("@clack/prompts"));

  if (!clackPrompts.ok) {
    return Result.err({
      _tag: "InteractiveRendererUnavailable",
      cause: clackPrompts.error,
      message: "No pude cargar el prompt interactivo (@clack/prompts).",
    });
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
    return Result.err({
      _tag: "InteractivePromptFailed",
      cause: answer.error,
      message: "No pude leer la confirmacion desde stdin.",
    });
  }

  if (isCancel(answer.value)) {
    return Result.err({
      _tag: "InteractionCancelled",
      message: "Interaccion cancelada.",
    });
  }

  return Result.ok(answer.value);
}
