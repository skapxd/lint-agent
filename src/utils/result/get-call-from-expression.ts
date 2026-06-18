import type { TSESTree } from "@typescript-eslint/utils";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getCallFromExpression(
  node: TSESTree.Node | null | undefined,
): TSESTree.CallExpression | null {
  const lacksNode = !node;
  if (lacksNode) {
    return null;
  }

  const unwrappedNode = unwrapExpression(node);
  const isAwaitExpression = unwrappedNode.type === "AwaitExpression";
  if (isAwaitExpression) {
    return getCallFromExpression(unwrappedNode.argument);
  }

  const isCallExpression = unwrappedNode.type === "CallExpression";

  return isCallExpression ? unwrappedNode : null;
}
