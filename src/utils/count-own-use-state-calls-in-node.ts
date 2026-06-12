import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";
import { isCalleeNamed } from "./is-callee-named";
import { isFunctionNode } from "./is-function-node";

export function countOwnUseStateCallsInNode(node: RuleNode): number {
  if (!isAstNode(node)) {
    return 0;
  }

  if (isFunctionNode(node)) {
    return 0;
  }

  const ownCount =
    node.type === "CallExpression" && isCalleeNamed(node.callee, ["useState"])
      ? 1
      : 0;

  return ownCount + getNodeChildren(node).reduce(
    (total: number, child: RuleNode) => total + countOwnUseStateCallsInNode(child),
    0,
  );
}
