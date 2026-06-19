import { Result } from "@skapxd/result";
import { renderCliOutput } from "./render-cli-output";
import { renderInteractiveOutput } from "#/utils/cli/output/interactive/render-interactive-output";
import type {
  CliIoError,
  CliOutputFormat,
  SkapxdLintOutput,
} from "#/utils/cli/types";

export async function writeCliOutput(
  output: SkapxdLintOutput,
  stream: NodeJS.WriteStream,
  format: CliOutputFormat | "interactive",
): Promise<Result<void, CliIoError>> {
  const needsMachineOutput = format !== "interactive";
  if (needsMachineOutput) {
    stream.write(renderCliOutput(output, format));
    return Result.ok(undefined);
  }

  return renderInteractiveOutput(output, stream);
}
