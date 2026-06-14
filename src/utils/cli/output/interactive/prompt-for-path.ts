import { Result, trySafe } from "@skapxd/result";
import type { PromptStreams } from "#/utils/cli/types";

export async function promptForPath(streams: PromptStreams) {
  const clackPrompts = await trySafe(() => import("@clack/prompts"));

  if (!clackPrompts.ok) {
    return Result.err(clackPrompts.error);
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
    return Result.err(answer.error);
  }

  if (isCancel(answer.value)) {
    return Result.err(new Error("Interaccion cancelada."));
  }

  return Result.ok(answer.value.trim());
}
