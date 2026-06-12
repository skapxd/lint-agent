import type { TSESTree } from "@typescript-eslint/utils";
export function getReturnedObjectExpression(node: TSESTree.Node | null) {
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
