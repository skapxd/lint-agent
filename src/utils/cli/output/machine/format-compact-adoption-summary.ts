import { formatCompactAdoptionRuleSummaries } from "./format-compact-adoption-rule-summaries";
import type { SkapxdLintOutput } from "#/utils/cli/types";

export function formatCompactAdoptionSummary(output: SkapxdLintOutput) {
  const adoption = output.adoption;

  if (!adoption) {
    return [];
  }

  return [
    `adopt ${adoption.percent}% | seed ${adoption.seed}`,
    `target ${adoption.targetViolationCount}/${adoption.totalViolationCount} violations | budget ${adoption.budget}`,
    ...formatCompactAdoptionRuleSummaries({
      countLabel: "viol",
      header: "rules (orden de resolucion, premisas primero):",
      rules: adoption.selectedRules,
    }),
  ];
}
