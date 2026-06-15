import { Result, trySafe } from "@skapxd/result";
import { ESLint } from "eslint";
import { createExecutionErrorOutput } from "#/utils/cli/output/machine/create-execution-error-output";
import { getChangedLintFiles } from "#/utils/cli/eslint-run/get-changed-lint-files";
import { summarizeLintResults } from "#/utils/cli/output/machine/summarize-lint-results";
import { toLintFileResults } from "#/utils/cli/output/machine/to-lint-file-results";
import type { SkapxdLintOutput } from "#/utils/cli/types";

/**
 * Ejecuta el modo `--changed`: limita ESLint a los archivos modificados contra una base Git y devuelve el mismo contrato de salida que los modos completos. La funcion existe para que el CLI pueda fallar de forma estable cuando Git no puede calcular el diff, en vez de mezclar ese error con errores de lint.
 *
 * ### Orden
 * resolver root + archivos cambiados -> sintetizar execution-error si Git falla -> saltar ESLint si no hay archivos -> lint con `warnIgnored: false` -> normalizar mensajes y resumen.
 *
 * ### Ejemplo
 * ```ts
 * await runChangedMode("origin/main", cwd); // dos .ts modificados -> lintea solo esos paths
 * await runChangedMode("origin/main", cwd); // sin cambios -> { status: "ok", files: [] }
 * ```
 */
export async function runChangedMode(base: string | null, cwd: string) {
  const changed = getChangedLintFiles(base, cwd);
  const hasGitFailure = changed === null;

  if (hasGitFailure) {
    return {
      errorCount: 0,
      files: [
        {
          errorCount: 1,
          filePath: "<git>",
          messages: [
            {
              column: 0,
              line: 0,
              message: "git no pudo calcular los archivos cambiados.",
              ruleId: null,
              severity: 2,
            },
          ],
          warningCount: 0,
        },
      ],
      mode: "changed",
      status: "execution-error",
      warningCount: 0,
    } satisfies SkapxdLintOutput;
  }

  const eslint = new ESLint({ cwd: changed.root, warnIgnored: false });
  const hasNoChangedFiles = changed.files.length === 0;
  const lintResults = hasNoChangedFiles
    ? Result.ok([])
    : await trySafe(() => eslint.lintFiles(changed.files));

  if (!lintResults.ok) {
    const message =
      lintResults.error instanceof Error
        ? lintResults.error.message
        : "ESLint fallo al lintear archivos cambiados.";

    return createExecutionErrorOutput(message, "changed");
  }

  const files = toLintFileResults(lintResults.value);
  const summary = summarizeLintResults(files);
  const status = summary.errorCount > 0 || summary.warningCount > 0 ? "findings" : "ok";

  return {
    changedFiles: changed.files,
    errorCount: summary.errorCount,
    files,
    mode: "changed",
    status,
    targetPath: changed.root,
    warningCount: summary.warningCount,
  } satisfies SkapxdLintOutput;
}
