import type { AdoptionRuleSummary } from "#/utils/cli/types";

export function selectAdoptionRules(
  ruleSummaries: AdoptionRuleSummary[],
  percent: number,
) {
  const totalViolationCount = ruleSummaries.reduce(
    (total, rule) => total + rule.violationCount,
    0,
  );
  const budget = Math.floor((totalViolationCount * percent) / 100);
  const selectedRules: AdoptionRuleSummary[] = [];
  let selectedViolationCount = 0;

  for (const rule of ruleSummaries) {
    const nextViolationCount = selectedViolationCount + rule.violationCount;
    const canIncludeRule = nextViolationCount <= budget;

    if (!canIncludeRule) {
      break;
    }

    selectedRules.push(rule);
    selectedViolationCount = nextViolationCount;
  }

  const lacksSelectedRules = selectedRules.length === 0;
  const easiestRule = ruleSummaries[0];
  const needsFallbackRule = lacksSelectedRules && easiestRule !== undefined;

  if (!needsFallbackRule) {
    return {
      budget,
      selectedRules,
      selectedViolationCount,
      totalViolationCount,
    };
  }

  selectedRules.push(easiestRule);
  selectedViolationCount = easiestRule.violationCount;

  return {
    budget,
    selectedRules,
    selectedViolationCount,
    totalViolationCount,
  };
}
