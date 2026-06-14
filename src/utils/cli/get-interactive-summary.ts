import pc from "picocolors";
import type { SkapxdLintOutput } from "./types";

export function getInteractiveSummary(output: SkapxdLintOutput) {
  const errorCount = pc.red(`${output.errorCount} error(es)`);
  const warningCount = pc.yellow(`${output.warningCount} warning(s)`);

  return `${errorCount}, ${warningCount}`;
}
