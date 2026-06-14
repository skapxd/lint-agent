import path from "node:path";
import type { SkapxdLintOutput } from "./types";

export function formatTextOutput(output: SkapxdLintOutput) {
  const lines: string[] = [];
  const title =
    output.mode === "changed"
      ? "skapxd-lint --changed"
      : `skapxd-lint (${output.preset ?? "preset desconocido"})`;

  lines.push(`${title}: ${output.errorCount} error(es), ${output.warningCount} warning(s)`);

  for (const file of output.files) {
    const hasNoMessages = file.messages.length === 0;
    if (hasNoMessages) {
      continue;
    }

    lines.push(`\n${path.relative(process.cwd(), file.filePath)}`);

    for (const message of file.messages) {
      lines.push(
        `  ${message.line}:${message.column}  ${message.message}  ${message.ruleId ?? "eslint"}`,
      );
    }
  }

  const hasNoFindings = output.errorCount === 0 && output.warningCount === 0;
  if (hasNoFindings) {
    lines.push("\nSin hallazgos.");
  }

  return `${lines.join("\n")}\n`;
}
