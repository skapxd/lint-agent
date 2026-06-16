import type {
  AdoptionRuleSummary,
  RulePlanEntry,
  RuleResolutionRole,
} from "#/utils/cli/types";

const skapxdRulePrefix = "skapxd/";

export function createRulePlan(ruleSummaries: readonly AdoptionRuleSummary[]) {
  const planRules = ruleSummaries.filter((rule) =>
    rule.ruleId.startsWith(skapxdRulePrefix),
  );
  const unblocksByRuleId = new Map<string, string[]>();

  for (const rule of planRules) {
    for (const blocker of rule.blockedBy ?? []) {
      const unblocks = unblocksByRuleId.get(blocker) ?? [];

      unblocks.push(rule.ruleId);
      unblocksByRuleId.set(blocker, unblocks);
    }
  }

  return planRules.map((rule) => {
    const blockedBy = rule.blockedBy ?? [];
    const unblocks = unblocksByRuleId.get(rule.ruleId) ?? [];
    const hasBlockers = blockedBy.length > 0;
    const hasDependents = unblocks.length > 0;
    const isPremise = !hasBlockers && hasDependents;
    let resolutionRole: RuleResolutionRole = "independent";

    if (hasBlockers) {
      resolutionRole = "blocked";
    }

    if (isPremise) {
      resolutionRole = "premise";
    }

    return {
      ...rule,
      resolutionRole,
      ...(unblocks.length > 0 ? { unblocks } : {}),
    } satisfies RulePlanEntry;
  });
}
