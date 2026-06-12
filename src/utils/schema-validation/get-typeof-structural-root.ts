import type { TSESTree } from "@typescript-eslint/utils";
import { getRootIdentifier } from "./get-root-identifier";

export function getTypeofStructuralRoot(
  node: TSESTree.UnaryExpression,
): TSESTree.Identifier | null {
  const isTypeofCheck = node.operator === "typeof";
  if (!isTypeofCheck) {
    return null;
  }

  return getRootIdentifier(node.argument);
}
