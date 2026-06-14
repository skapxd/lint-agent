import pc from "picocolors";
import type { SkapxdLintOutput } from "#/utils/cli/types";

export function getInteractiveSummary(output: SkapxdLintOutput) {
  const errorCount = pc.red(`${output.errorCount} error(es)`);
  const warningCount = pc.yellow(`${output.warningCount} warning(s)`);
  const omittedFiles = output.omittedFileCount ?? 0;
  const omittedSummary =
    omittedFiles > 0 ? `, ${pc.dim(`${omittedFiles} omitido(s)`)}` : "";

  return `${errorCount}, ${warningCount}${omittedSummary}`;
}
