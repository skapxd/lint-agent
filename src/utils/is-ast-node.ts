import type { LegacyAstNode } from "#/utils/rule-types";
export function isAstNode(value: LegacyAstNode) {
  return Boolean(value && typeof value === "object" && "type" in value);
}
