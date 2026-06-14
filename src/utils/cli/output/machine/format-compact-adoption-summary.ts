import type { SkapxdLintOutput } from "#/utils/cli/types";

export function formatCompactAdoptionSummary(output: SkapxdLintOutput) {
  const adoption = output.adoption;

  if (!adoption) {
    return [];
  }

  const selectedRules = adoption.selectedRules.map(
    (rule) =>
      `  - ${rule.ruleId}: ${rule.violationCount} violations, ${rule.affectedFileCount} files`,
  );

  return [
    `adopt ${adoption.percent}% | seed ${adoption.seed}`,
    `target ${adoption.targetViolationCount}/${adoption.totalViolationCount} violations | budget ${adoption.budget}`,
    "rules:",
    ...selectedRules,
  ];
}
