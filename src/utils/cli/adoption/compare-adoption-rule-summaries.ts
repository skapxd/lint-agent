import type { AdoptionRuleSummary } from "#/utils/cli/types";

export function compareAdoptionRuleSummaries(
  left: AdoptionRuleSummary,
  right: AdoptionRuleSummary,
) {
  const layerDelta = left.dependencyLayer - right.dependencyLayer;
  const affectedFileDelta = left.affectedFileCount - right.affectedFileCount;
  const violationDelta = left.violationCount - right.violationCount;

  return (
    layerDelta ||
    affectedFileDelta ||
    violationDelta ||
    left.ruleId.localeCompare(right.ruleId)
  );
}
