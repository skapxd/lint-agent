import { getLintMessageRuleId } from "./get-lint-message-rule-id";
import type { LintFileResult } from "#/utils/cli/types";

export function filterLintFilesByRuleIds(
  files: LintFileResult[],
  ruleIds: readonly string[],
) {
  const selectedRuleIds = new Set(ruleIds);

  return files.flatMap((file) => {
    const messages = file.messages.filter((message) =>
      selectedRuleIds.has(getLintMessageRuleId(message)),
    );
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
