import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isFunctionNode } from "#/utils/ast/is-function-node";
import { isResultErrCall } from "./is-result-err-call";

export function getOwnResultErrCalls(
  node: RuleNode | null,
  isRoot: boolean = true,
): RuleNode[] {
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
    ...getNodeChildren(node).flatMap((child: RuleNode) => getOwnResultErrCalls(child, false)),
  ];
}
