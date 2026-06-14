import type { LintFileResult } from "./types";

export function summarizeLintResults(files: LintFileResult[]) {
  return files.reduce(
    (summary, file) => ({
      errorCount: summary.errorCount + file.errorCount,
      warningCount: summary.warningCount + file.warningCount,
    }),
    { errorCount: 0, warningCount: 0 },
  );
}
