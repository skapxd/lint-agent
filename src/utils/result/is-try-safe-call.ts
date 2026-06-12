import type { TSESTree } from "@typescript-eslint/utils";
import { isCalleeNamed } from "#/utils/ast/is-callee-named";

export function isTrySafeCall(
  node: TSESTree.Node | null | undefined,
  trySafeCallNames: readonly string[],
): node is TSESTree.CallExpression {
  return (
    node?.type === "CallExpression" &&
    isCalleeNamed(node.callee, trySafeCallNames)
  );
}
