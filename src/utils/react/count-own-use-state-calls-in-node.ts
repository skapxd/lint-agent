import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isCalleeNamed } from "#/utils/ast/is-callee-named";
import { isFunctionNode } from "#/utils/ast/is-function-node";

export function countOwnUseStateCallsInNode(node: TSESTree.Node): number {
  if (!isAstNode(node)) {
    return 0;
  }

  const isFunctionBoundary = isFunctionNode(node);
  if (isFunctionBoundary) {
    return 0;
  }

  const ownCount =
    node.type === "CallExpression" && isCalleeNamed(node.callee, ["useState"])
      ? 1
      : 0;

  return ownCount + getNodeChildren(node).reduce(
    (total: number, child: TSESTree.Node) => total + countOwnUseStateCallsInNode(child),
    0,
  );
}
