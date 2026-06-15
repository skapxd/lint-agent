import { getLintMessageRuleId } from "./get-lint-message-rule-id";
import { getRuleLayer } from "./get-rule-layer";
import { RULE_DEPENDENCIES } from "./rule-dependencies";
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

  const ruleIdsWithFindings = new Set(summariesByRule.keys());

  return [...summariesByRule.entries()]
    .map(([ruleId, summary]) => {
      const dependencies = RULE_DEPENDENCIES[ruleId] ?? [];
      const blockedBy = dependencies.filter((dependency) =>
        ruleIdsWithFindings.has(dependency),
      );

      return {
        affectedFileCount: summary.filePaths.size,
        dependencyLayer: getRuleLayer(ruleId),
        ...(blockedBy.length > 0 ? { blockedBy } : {}),
        ruleId,
        violationCount: summary.violationCount,
      };
    })
    .sort((left, right) => {
      const layerDelta = left.dependencyLayer - right.dependencyLayer;
      const affectedFileDelta =
        left.affectedFileCount - right.affectedFileCount;
      const violationDelta = left.violationCount - right.violationCount;

      return (
        layerDelta ||
        affectedFileDelta ||
        violationDelta ||
        left.ruleId.localeCompare(right.ruleId)
      );
    }) satisfies AdoptionRuleSummary[];
}
