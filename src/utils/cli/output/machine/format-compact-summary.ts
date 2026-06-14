import type { SkapxdLintOutput } from "#/utils/cli/types";

export function formatCompactSummary(output: SkapxdLintOutput) {
  const preset = output.preset ?? "none";
  const findingFiles = output.files.filter((file) => file.messages.length > 0);
  const omittedFiles = output.omittedFileCount ?? 0;
  const omittedSummary = omittedFiles > 0 ? ` | ${omittedFiles} omitted` : "";

  return `${output.errorCount} errors | ${findingFiles.length} files | preset ${preset}${omittedSummary}`;
}
