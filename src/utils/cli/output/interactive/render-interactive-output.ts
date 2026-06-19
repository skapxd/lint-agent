import { Result, trySafe } from "@skapxd/result";
import { formatInteractiveFileNote } from "./format-interactive-file-note";
import { getInteractiveOutputTitle } from "./get-interactive-output-title";
import { getInteractiveSummary } from "./get-interactive-summary";
import type { CliIoError, SkapxdLintOutput } from "#/utils/cli/types";

export async function renderInteractiveOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
): Promise<Result<void, CliIoError>> {
  const clackPrompts = await trySafe(() => import("@clack/prompts"));

  if (!clackPrompts.ok) {
    return Result.err({
      _tag: "InteractiveRendererUnavailable",
      cause: clackPrompts.error,
      message: "No pude cargar el renderer interactivo (@clack/prompts).",
    });
  }

  const { intro, log, note, outro } = clackPrompts.value;
  const title = getInteractiveOutputTitle(output);
  const summary = getInteractiveSummary(output);
  const hasFindings = output.errorCount > 0 || output.warningCount > 0;

  intro(title, { output: stream });

  if (!hasFindings) {
    log.success("Sin hallazgos.", { output: stream });
    outro("Listo.", { output: stream });
    return Result.ok(undefined);
  }

  log.error(summary, { output: stream });

  for (const file of output.files) {
    const hasMessages = file.messages.length > 0;

    if (hasMessages) {
      const fileNote = formatInteractiveFileNote(file);
      note(fileNote.messages, fileNote.title, { output: stream });
    }
  }

  outro("Revisa los hallazgos y vuelve a ejecutar el comando.", {
    output: stream,
  });

  return Result.ok(undefined);
}
