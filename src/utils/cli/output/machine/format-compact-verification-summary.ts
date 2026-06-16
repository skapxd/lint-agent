import { formatCompactAdoptionRuleSummaries } from "./format-compact-adoption-rule-summaries";
import type { SkapxdLintOutput } from "#/utils/cli/types";

export function formatCompactVerificationSummary(output: SkapxdLintOutput) {
  const verification = output.verification;

  if (!verification) {
    return [];
  }

  const state = verification.completed ? "complete" : "pending";

  return [
    `verify ${state} | seed ${verification.seed}`,
    `target ${verification.remainingViolationCount} remaining | ${verification.fixedRuleCount}/${verification.targetRules.length} rules fixed`,
    `outside target: ${verification.outsideViolationCount} info violations`,
    ...formatCompactAdoptionRuleSummaries({
      countLabel: "remaining",
      header: "remaining rules (orden de resolucion, premisas primero):",
      rules: verification.remainingRules,
    }),
  ];
}
