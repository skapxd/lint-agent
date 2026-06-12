import type { TSESTree } from "@typescript-eslint/utils";
export function unwrapExpression(node: TSESTree.Node) {
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
