import type { TSESTree } from "@typescript-eslint/utils";
import { getCallStructuralRoot } from "./get-call-structural-root";
import { getInStructuralRoot } from "./get-in-structural-root";
import { getTypeofStructuralRoot } from "./get-typeof-structural-root";

export function getStructuralCheckRoot(
  node: TSESTree.Node,
): TSESTree.Identifier | null {
  const isUnaryExpression = node.type === "UnaryExpression";
  if (isUnaryExpression) {
    return getTypeofStructuralRoot(node);
  }

  const isBinaryExpression = node.type === "BinaryExpression";
  if (isBinaryExpression) {
    return getInStructuralRoot(node);
  }

  const isCallExpression = node.type === "CallExpression";
  if (isCallExpression) {
    return getCallStructuralRoot(node);
  }

  return null;
}
