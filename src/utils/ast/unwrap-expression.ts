import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function unwrapExpression(node: RuleNode) {
  const isTransparentExpression = node.type === "ChainExpression" ||
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSNonNullExpression";
  if (
    isTransparentExpression
  ) {
    return unwrapExpression(node.expression);
  }

  return node;
}
