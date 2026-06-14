import { Result, trySafe } from "@skapxd/result";
import { ESLint } from "eslint";
import { createExecutionErrorOutput } from "./create-execution-error-output";
import { getChangedLintFiles } from "./get-changed-lint-files";
import { summarizeLintResults } from "./summarize-lint-results";
import { toLintFileResults } from "./to-lint-file-results";
import type { SkapxdLintOutput } from "./types";

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
