import { Result } from "@skapxd/result";
import { reportCliInfrastructureError } from "./report-cli-infrastructure-error";
import { writeCliOutput } from "./write-cli-output";
import type {
  CliIoError,
  CliOutputFormat,
  SkapxdLintOutput,
} from "#/utils/cli/types";

export async function writeCliOutputOrReport(
  output: SkapxdLintOutput,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream,
  format: CliOutputFormat | "interactive",
): Promise<Result<void, CliIoError>> {
  const outputWrite = await writeCliOutput(output, stdout, format);

  if (outputWrite.ok) {
    return Result.ok(undefined);
  }

  stderr.write("skapxd-lint no pudo escribir la salida.\n");
  reportCliInfrastructureError(outputWrite.error, stderr);

  return Result.err(outputWrite.error);
}
