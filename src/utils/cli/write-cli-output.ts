import { renderInteractiveOutput } from "./render-interactive-output";
import type { SkapxdLintOutput } from "./types";

export function writeCliOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
  json: boolean,
) {
  if (json) {
    stream.write(`${JSON.stringify(output, null, 2)}\n`);
    return;
  }

  renderInteractiveOutput(output, stream);
}
