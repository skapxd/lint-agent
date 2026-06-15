import { renderCompactOutput } from "./render-compact-output";
import { renderToonCliOutput } from "./render-toon-cli-output";
import type { CliOutputFormat, SkapxdLintOutput } from "#/utils/cli/types";

export function renderCliOutput(
  output: SkapxdLintOutput,
  format: CliOutputFormat,
) {
  const needsCompactOutput = format === "compact";
  const needsJsonOutput = format === "json";

  if (needsCompactOutput) {
    return renderCompactOutput(output);
  }

  if (needsJsonOutput) {
    return `${JSON.stringify(output, null, 2)}\n`;
  }

  return renderToonCliOutput(output);
}
