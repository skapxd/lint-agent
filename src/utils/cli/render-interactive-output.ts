import { intro, log, note, outro } from "@clack/prompts";
import { formatInteractiveFileNote } from "./format-interactive-file-note";
import { getInteractiveOutputTitle } from "./get-interactive-output-title";
import { getInteractiveSummary } from "./get-interactive-summary";
import type { SkapxdLintOutput } from "./types";

export function renderInteractiveOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
) {
  const title = getInteractiveOutputTitle(output);
  const summary = getInteractiveSummary(output);
  const hasFindings = output.errorCount > 0 || output.warningCount > 0;

  intro(title, { output: stream });

  if (!hasFindings) {
    log.success("Sin hallazgos.", { output: stream });
    outro("Listo.", { output: stream });
    return;
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
}
