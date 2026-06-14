import type { ESLint } from "eslint";
import { toCliLocationNumber } from "./to-cli-location-number";
import type { LintFileResult } from "#/utils/cli/types";

export function toLintFileResults(results: ESLint.LintResult[]): LintFileResult[] {
  return results.map((result) => ({
    errorCount: result.errorCount,
    filePath: result.filePath,
    messages: result.messages.map((message) => ({
      column: toCliLocationNumber(message.column),
      line: toCliLocationNumber(message.line),
      message: message.message,
      ruleId: message.ruleId,
      severity: message.severity,
    })),
    warningCount: result.warningCount,
  }));
}
