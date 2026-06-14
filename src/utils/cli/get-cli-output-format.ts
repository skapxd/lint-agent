import type { CliArguments, CliOutputFormat } from "./types";

export function getCliOutputFormat(
  argumentsValue: CliArguments,
  interactive: boolean,
): CliOutputFormat | "interactive" {
  if (argumentsValue.format) {
    return argumentsValue.format;
  }

  return interactive ? "interactive" : "compact";
}
