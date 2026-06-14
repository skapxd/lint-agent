import type { SkapxdLintOutput } from "#/utils/cli/types";

export function formatCompactSummary(output: SkapxdLintOutput) {
  const preset = output.preset ?? "none";
  const findingFiles = output.files.filter((file) => file.messages.length > 0);

  return `${output.errorCount} errors | ${findingFiles.length} files | preset ${preset}`;
}
