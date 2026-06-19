import { Result, trySafe } from "@skapxd/result";
import type { CliIoError, PromptStreams } from "#/utils/cli/types";

export async function promptForPath(
  streams: PromptStreams,
): Promise<Result<string, CliIoError>> {
  const clackPrompts = await trySafe(() => import("@clack/prompts"));

  if (!clackPrompts.ok) {
    return Result.err({
      _tag: "InteractiveRendererUnavailable",
      cause: clackPrompts.error,
      message: "No pude cargar el prompt interactivo (@clack/prompts).",
    });
  }

  const { isCancel, text } = clackPrompts.value;
  const answer = await trySafe(() =>
    text({
      input: streams.input,
      message: "Path a evaluar",
      output: streams.output,
      placeholder: ".",
      validate(value) {
        const lacksPath = !value || value.trim().length === 0;

        if (lacksPath) {
          return "Ingresa una ruta.";
        }

        return undefined;
      },
    }),
  );

  if (!answer.ok) {
    return Result.err({
      _tag: "InteractivePromptFailed",
      cause: answer.error,
      message: "No pude leer <path> desde stdin.",
    });
  }

  if (isCancel(answer.value)) {
    return Result.err({
      _tag: "InteractionCancelled",
      message: "Interaccion cancelada.",
    });
  }

  return Result.ok(answer.value.trim());
}
