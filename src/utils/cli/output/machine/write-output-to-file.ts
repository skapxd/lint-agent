import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Result, trySafe } from "@skapxd/result";
import { renderCliOutput } from "./render-cli-output";
import type { CliOutputFormat, SkapxdLintOutput } from "#/utils/cli/types";

export function writeOutputToFile(
  output: SkapxdLintOutput,
  format: CliOutputFormat,
  outputPath: string,
  cwd: string,
): Result<void, unknown> {
  const resolvedOutputPath = resolve(cwd, outputPath);
  const outputDirectory = dirname(resolvedOutputPath);
  const directoryExists = existsSync(outputDirectory);

  if (!directoryExists) {
    return Result.err(
      new Error(
        `No pude escribir la salida en ${outputPath}: el directorio ${outputDirectory} no existe.`,
      ),
    );
  }

  const outputWrite = trySafe(() =>
    writeFileSync(resolvedOutputPath, renderCliOutput(output, format), "utf8"),
  );

  if (outputWrite.ok) {
    return Result.ok(undefined);
  }

  return Result.err(outputWrite.error);
}
