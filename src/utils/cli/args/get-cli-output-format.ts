import type { CliArguments, CliOutputFormat } from "#/utils/cli/types";

export function getCliOutputFormat(
  argumentsValue: CliArguments,
  interactive: boolean,
): CliOutputFormat | "interactive" {
  if (argumentsValue.format) {
    return argumentsValue.format;
  }

  return interactive ? "interactive" : "compact";
}
