import type {
  AdoptionRuleSummary,
  RulePlanEntry,
  RuleResolutionRole,
} from "#/utils/cli/types";

const firstHumanPosition = 1;
const singularFileCount = 1;
const skapxdRulePrefix = "skapxd/";

type FormatCompactAdoptionRuleSummariesInput = {
  countLabel: string;
  header: string;
  rules: readonly (AdoptionRuleSummary | RulePlanEntry)[];
};

/**
 * ### Lista compacta de reglas de adopcion
 *
 * El compact es lectura humana, pero aun debe transmitir el contrato operativo
 * del lote: resolver de arriba abajo, distinguir premisas y no atacar
 * dependientes bloqueadas antes de tiempo.
 *
 * ```text
 * 1. skapxd/premisa [premisa]
 * 2. skapxd/dependiente [bloqueada por: premisa]
 * ```
 */
export function formatCompactAdoptionRuleSummaries({
  countLabel,
  header,
  rules,
}: FormatCompactAdoptionRuleSummariesInput) {
  const lacksRules = rules.length === 0;

  if (lacksRules) {
    return [];
  }

  const premiseRuleIds = new Set(rules.flatMap((rule) => rule.blockedBy ?? []));
  const formattedRules = rules.map((rule, index) => {
    const humanPosition = index + firstHumanPosition;
    const blockers = rule.blockedBy ?? [];
    const blockerRuleIds = blockers.map((blockedRuleId) => {
      const hasSkapxdPrefix = blockedRuleId.startsWith(skapxdRulePrefix);

      return hasSkapxdPrefix
        ? blockedRuleId.slice(skapxdRulePrefix.length)
        : blockedRuleId;
    });
    const hasBlockers = blockerRuleIds.length > 0;
    const isInferredPremise = !hasBlockers && premiseRuleIds.has(rule.ruleId);
    let inferredResolutionRole: RuleResolutionRole = "independent";

    if (hasBlockers) {
      inferredResolutionRole = "blocked";
    }

    if (isInferredPremise) {
      inferredResolutionRole = "premise";
    }

    const resolutionRole =
      "resolutionRole" in rule ? rule.resolutionRole : inferredResolutionRole;
    const premiseAnnotation = resolutionRole === "premise" ? " [premisa]" : "";
    const blockerAnnotation = hasBlockers
      ? ` [bloqueada por: ${blockerRuleIds.join(", ")}]`
      : "";
    const independentAnnotation =
      resolutionRole === "independent" ? " [independiente]" : "";
    const fileLabel =
      rule.affectedFileCount === singularFileCount ? "file" : "files";

    return `  ${humanPosition}. ${rule.ruleId}: ${rule.violationCount} ${countLabel}, ${rule.affectedFileCount} ${fileLabel}${premiseAnnotation}${blockerAnnotation}${independentAnnotation}`;
  });

  return [header, ...formattedRules];
}
