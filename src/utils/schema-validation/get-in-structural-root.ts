import type { TSESTree } from "@typescript-eslint/utils";
import { getRootIdentifier } from "./get-root-identifier";

export function getInStructuralRoot(
  node: TSESTree.BinaryExpression,
): TSESTree.Identifier | null {
  const isInCheck = node.operator === "in";
  if (!isInCheck) {
    return null;
  }

  const hasStructuralKey = node.left.type === "Literal" ||
    node.left.type === "TemplateLiteral";
  if (!hasStructuralKey) {
    return null;
  }

  return getRootIdentifier(node.right);
}
