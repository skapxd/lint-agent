import type { TSESTree } from "@typescript-eslint/utils";

export function getRootIdentifier(
  node: TSESTree.Node | null | undefined,
): TSESTree.Identifier | null {
  const lacksNode = !node;
  if (lacksNode) {
    return null;
  }

  const isIdentifierNode = node.type === "Identifier";
  if (isIdentifierNode) {
    return node;
  }

  const isTransparentExpression = node.type === "ChainExpression" ||
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSNonNullExpression";
  if (isTransparentExpression) {
    return getRootIdentifier(node.expression);
  }

  const isMemberExpressionNode = node.type === "MemberExpression";
  if (isMemberExpressionNode) {
    return getRootIdentifier(node.object);
  }

  return null;
}
