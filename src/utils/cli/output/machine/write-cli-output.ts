import { Result } from "@skapxd/result";
import { renderCompactOutput } from "./render-compact-output";
import { renderInteractiveOutput } from "#/utils/cli/output/interactive/render-interactive-output";
import { writeToonCliOutput } from "./write-toon-cli-output";
import type { CliOutputFormat, SkapxdLintOutput } from "#/utils/cli/types";

export async function writeCliOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
  format: CliOutputFormat | "interactive",
): Promise<Result<void, unknown>> {
  const needsCompactOutput = format === "compact";
  const needsJsonOutput = format === "json";
  const needsToonOutput = format === "toon";

  if (needsCompactOutput) {
    stream.write(renderCompactOutput(output));
    return Result.ok(undefined);
  }

  if (needsJsonOutput) {
    stream.write(`${JSON.stringify(output, null, 2)}\n`);
    return Result.ok(undefined);
  }

  if (needsToonOutput) {
    writeToonCliOutput(output, stream);
    return Result.ok(undefined);
  }

  return renderInteractiveOutput(output, stream);
}
