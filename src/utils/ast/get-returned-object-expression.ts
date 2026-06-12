import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getReturnedObjectExpression(node: RuleNode) {
  if (!node) {
    return null;
  }

  const isObjectExpressionNode = node.type === "ObjectExpression";
  if (isObjectExpressionNode) {
    return node;
  }

  const isTransparentWrapper = node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSNonNullExpression" ||
    node.type === "ChainExpression";
  if (
    isTransparentWrapper
  ) {
    return getReturnedObjectExpression(node.expression);
  }

  return null;
}
