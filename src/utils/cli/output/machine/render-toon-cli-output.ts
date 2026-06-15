import { encodeLines } from "@toon-format/toon";
import { createToonLintOutput } from "./create-toon-lint-output";
import type { SkapxdLintOutput } from "#/utils/cli/types";

export function renderToonCliOutput(output: SkapxdLintOutput) {
  return `${Array.from(encodeLines(createToonLintOutput(output))).join("\n")}\n`;
}
