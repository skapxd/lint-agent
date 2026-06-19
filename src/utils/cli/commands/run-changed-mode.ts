import { Result, trySafe } from "@skapxd/result";
import { ESLint } from "eslint";
import { createAdoptionRuleSummaries } from "#/utils/cli/adoption/create-adoption-rule-summaries";
import { getChangedLintFiles } from "#/utils/cli/eslint-run/get-changed-lint-files";
import { createReportGuidance } from "#/utils/cli/output/report/create-report-guidance";
import { summarizeLintResults } from "#/utils/cli/output/machine/summarize-lint-results";
import { toLintFileResults } from "#/utils/cli/output/machine/to-lint-file-results";
import type { CliExecutionError, SkapxdLintOutput } from "#/utils/cli/types";

/**
 * Ejecuta el modo `--changed`: limita ESLint a los archivos modificados contra una base Git y devuelve el mismo contrato de salida que los modos completos dentro de un `Result`. La funcion existe para que el CLI pueda fallar de forma estable cuando Git no puede calcular el diff, en vez de mezclar ese error con errores de lint.
 *
 * ### Orden
 * resolver root + archivos cambiados -> sintetizar execution-error si Git falla -> saltar ESLint si no hay archivos -> lint con `warnIgnored: false` -> normalizar mensajes y resumen.
 *
 * ### Ejemplo
 * ```ts
 * await runChangedMode("origin/main", cwd); // ok -> dos .ts modificados linteados
 * await runChangedMode("origin/main", cwd); // ok -> { status: "ok", files: [] }
 * ```
 */
export async function runChangedMode(
  base: string | null,
  cwd: string,
): Promise<Result<SkapxdLintOutput, CliExecutionError>> {
  const changed = getChangedLintFiles(base, cwd);
  const hasGitFailure = changed === null;

  if (hasGitFailure) {
    return Result.ok({
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
    } satisfies SkapxdLintOutput);
  }

  const eslint = trySafe(() => new ESLint({ cwd: changed.root, warnIgnored: false }));
  if (!eslint.ok) {
    return Result.err({
      _tag: "CliExecutionError",
      cause: eslint.error,
      message: "No se pudo inicializar ESLint para el modo --changed.",
    });
  }

  const hasNoChangedFiles = changed.files.length === 0;
  const lintResults = hasNoChangedFiles
    ? Result.ok([])
    : await trySafe(() => eslint.value.lintFiles(changed.files));

  if (!lintResults.ok) {
    return Result.err({
      _tag: "CliExecutionError",
      cause: lintResults.error,
      message: "ESLint fallo al lintar los archivos cambiados.",
    });
  }

  const files = toLintFileResults(lintResults.value);
  const ruleSummaries = createAdoptionRuleSummaries(files);
  const summary = summarizeLintResults(files);
  const status = summary.errorCount > 0 || summary.warningCount > 0 ? "findings" : "ok";

  return Result.ok({
    changedFiles: changed.files,
    ...createReportGuidance({
      errorCount: summary.errorCount,
      files,
      ruleSummaries,
      warningCount: summary.warningCount,
    }),
    errorCount: summary.errorCount,
    files,
    mode: "changed",
    ruleSummaries,
    status,
    targetPath: changed.root,
    warningCount: summary.warningCount,
  } satisfies SkapxdLintOutput);
}
