// @ts-nocheck
export function getReturnedObjectExpression(node) {
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
