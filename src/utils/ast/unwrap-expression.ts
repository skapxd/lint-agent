import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function unwrapExpression(node: RuleNode) {
  if (
    node.type === "ChainExpression" ||
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSNonNullExpression"
  ) {
    return unwrapExpression(node.expression);
  }

  return node;
}
