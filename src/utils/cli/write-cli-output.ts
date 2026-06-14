import { renderInteractiveOutput } from "./render-interactive-output";
import { writeToonCliOutput } from "./write-toon-cli-output";
import type { CliOutputFormat, SkapxdLintOutput } from "./types";

export function writeCliOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
  format: CliOutputFormat | "interactive",
) {
  const needsJsonOutput = format === "json";
  const needsToonOutput = format === "toon";

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
