import { renderCompactOutput } from "./render-compact-output";
import { renderInteractiveOutput } from "./render-interactive-output";
import { writeToonCliOutput } from "./write-toon-cli-output";
import type { CliOutputFormat, SkapxdLintOutput } from "./types";

export function writeCliOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
  format: CliOutputFormat | "interactive",
) {
  const needsCompactOutput = format === "compact";
  const needsJsonOutput = format === "json";
  const needsToonOutput = format === "toon";

  if (needsCompactOutput) {
    stream.write(renderCompactOutput(output));
    return;
  }

  if (needsJsonOutput) {
    stream.write(`${JSON.stringify(output, null, 2)}\n`);
    return;
  }

  if (needsToonOutput) {
    writeToonCliOutput(output, stream);
    return;
  }

  renderInteractiveOutput(output, stream);
}
