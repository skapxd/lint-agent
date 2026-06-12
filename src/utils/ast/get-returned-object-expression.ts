import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getReturnedObjectExpression(node: RuleNode) {
  if (!node) {
    return null;
  }

  if (node.type === "ObjectExpression") {
    return node;
  }

  if (
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSNonNullExpression" ||
    node.type === "ChainExpression"
  ) {
    return getReturnedObjectExpression(node.expression);
  }

  return null;
}
