import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isFunctionNode } from "#/utils/ast/is-function-node";
import { isResultErrCall } from "./is-result-err-call";

export function getOwnResultErrCalls(
  node: TSESTree.Node | null,
  isRoot: boolean = true,
): TSESTree.CallExpression[] {
  if (!isAstNode(node)) {
    return [];
  }

  const reachedResultSearchBoundary = isFunctionNode(node) || (!isRoot && node.type === "IfStatement");
  if (reachedResultSearchBoundary) {
    return [];
  }

  const ownCalls = isResultErrCall(node) ? [node] : [];

  return [
    ...ownCalls,
    ...getNodeChildren(node).flatMap((child: TSESTree.Node) => getOwnResultErrCalls(child, false)),
  ];
}
