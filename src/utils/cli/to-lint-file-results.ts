import type { ESLint } from "eslint";
import type { LintFileResult } from "./types";

export function toLintFileResults(results: ESLint.LintResult[]): LintFileResult[] {
  return results.map((result) => ({
    errorCount: result.errorCount,
    filePath: result.filePath,
    messages: result.messages.map((message) => ({
      column: message.column,
      line: message.line,
      message: message.message,
      ruleId: message.ruleId,
      severity: message.severity,
    })),
    warningCount: result.warningCount,
  }));
}
