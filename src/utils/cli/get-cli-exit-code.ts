import type { SkapxdLintOutput } from "./types";

export function getCliExitCode(output: SkapxdLintOutput) {
  const hasFindings = output.errorCount > 0 || output.warningCount > 0;
  const hasTerminalCliError =
    output.status === "usage-error" || output.status === "execution-error";

  if (hasTerminalCliError) {
    return 2;
  }

  if (hasFindings) {
    return 1;
  }

  return 0;
}
