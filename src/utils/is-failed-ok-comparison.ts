import type { LegacyAstNode } from "#/utils/rule-types";
export function isFailedOkComparison(operator: LegacyAstNode, comparedValue: LegacyAstNode) {
  return (
    (operator === "===" && comparedValue === false) ||
    (operator === "!==" && comparedValue === true)
  );
}
