// @ts-nocheck
export function unwrapExpression(node) {
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
