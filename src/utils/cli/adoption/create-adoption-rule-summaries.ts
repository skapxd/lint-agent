import { getLintMessageRuleId } from "./get-lint-message-rule-id";
import type { AdoptionRuleSummary, LintFileResult } from "#/utils/cli/types";

type RuleAccumulator = {
  filePaths: Set<string>;
  violationCount: number;
};

export function createAdoptionRuleSummaries(files: LintFileResult[]) {
  const summariesByRule = new Map<string, RuleAccumulator>();

  for (const file of files) {
    for (const message of file.messages) {
      const ruleId = getLintMessageRuleId(message);

      if (ruleId === null) {
        continue;
      }

      const summary = summariesByRule.get(ruleId) ?? {
        filePaths: new Set<string>(),
        violationCount: 0,
      };

      summary.filePaths.add(file.filePath);
      summary.violationCount += 1;
      summariesByRule.set(ruleId, summary);
    }
  }

  return [...summariesByRule.entries()]
    .map(([ruleId, summary]) => ({
      affectedFileCount: summary.filePaths.size,
      ruleId,
      violationCount: summary.violationCount,
    }))
    .sort((left, right) => {
      const affectedFileDelta =
        left.affectedFileCount - right.affectedFileCount;
      const violationDelta = left.violationCount - right.violationCount;

      return (
        affectedFileDelta ||
        violationDelta ||
        left.ruleId.localeCompare(right.ruleId)
      );
    }) satisfies AdoptionRuleSummary[];
}
