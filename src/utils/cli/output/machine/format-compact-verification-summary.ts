import type { SkapxdLintOutput } from "#/utils/cli/types";

export function formatCompactVerificationSummary(output: SkapxdLintOutput) {
  const verification = output.verification;

  if (!verification) {
    return [];
  }

  const state = verification.completed ? "complete" : "pending";
  const remainingRules = verification.remainingRules.map(
    (rule) =>
      `  - ${rule.ruleId}: ${rule.violationCount} remaining, ${rule.affectedFileCount} files`,
  );

  return [
    `verify ${state} | seed ${verification.seed}`,
    `target ${verification.remainingViolationCount} remaining | ${verification.fixedRuleCount}/${verification.targetRules.length} rules fixed`,
    `outside target: ${verification.outsideViolationCount} info violations`,
    ...remainingRules,
  ];
}
