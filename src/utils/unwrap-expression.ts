import type { LegacyAstNode } from "#/utils/rule-types";
export function unwrapExpression(node: LegacyAstNode) {
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
