import type { RuleNode } from "#/utils/rule-types";
export function isAstNode(value: unknown): value is RuleNode {
  return Boolean(value && typeof value === "object" && "type" in value);
}
