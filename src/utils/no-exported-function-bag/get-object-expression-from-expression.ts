import type { TSESTree } from "@typescript-eslint/utils";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getObjectExpressionFromExpression(node: TSESTree.Node | null | undefined) {
  const hasExpressionNode = node !== null && node !== undefined;
  if (!hasExpressionNode) {
    return undefined;
  }

  const unwrappedNode = unwrapExpression(node);
  const isObjectExpressionNode = unwrappedNode.type === "ObjectExpression";
  if (!isObjectExpressionNode) {
    return undefined;
  }

  return unwrappedNode;
}
