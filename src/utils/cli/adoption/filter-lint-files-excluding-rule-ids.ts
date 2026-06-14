import { getLintMessageRuleId } from "./get-lint-message-rule-id";
import type { LintFileResult } from "#/utils/cli/types";

export function filterLintFilesExcludingRuleIds(
  files: LintFileResult[],
  ruleIds: readonly string[],
) {
  const excludedRuleIds = new Set(ruleIds);

  return files.flatMap((file) => {
    const messages = file.messages.filter((message) => {
      const ruleId = getLintMessageRuleId(message);

      return ruleId === null || !excludedRuleIds.has(ruleId);
    });
    const errorCount = messages.filter((message) => message.severity === 2).length;
    const warningCount = messages.filter((message) => message.severity === 1).length;
    const hasSelectedMessages = messages.length > 0;

    if (!hasSelectedMessages) {
      return [];
    }

    return [
      {
        errorCount,
        filePath: file.filePath,
        messages,
        warningCount,
      },
    ];
  });
}
