import type { LegacyAstNode } from "#/utils/rule-types";
export function matchesAnyPattern(value: LegacyAstNode, patterns: LegacyAstNode) {
  return patterns.some((pattern: LegacyAstNode) => new RegExp(pattern).test(value));
}
