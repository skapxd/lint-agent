import type { LegacyAstNode } from "#/utils/rule-types";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";
import { isFunctionNode } from "./is-function-node";
import { isResultErrCall } from "./is-result-err-call";

export function getOwnResultErrCalls(
  node: LegacyAstNode,
  isRoot: LegacyAstNode = true,
): LegacyAstNode[] {
  if (!isAstNode(node)) {
    return [];
  }

  if (isFunctionNode(node) || (!isRoot && node.type === "IfStatement")) {
    return [];
  }

  const ownCalls =
    node.type === "CallExpression" && isResultErrCall(node) ? [node] : [];

  return [
    ...ownCalls,
    ...getNodeChildren(node).flatMap((child: LegacyAstNode) => getOwnResultErrCalls(child, false)),
  ];
}
