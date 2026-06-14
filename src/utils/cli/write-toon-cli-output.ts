import { encodeLines } from "@toon-format/toon";
import { createToonLintOutput } from "./create-toon-lint-output";
import type { SkapxdLintOutput } from "./types";

export function writeToonCliOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
) {
  for (const line of encodeLines(createToonLintOutput(output))) {
    stream.write(`${line}\n`);
  }
}
