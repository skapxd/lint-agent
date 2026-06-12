import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";
import { isCalleeNamed } from "./is-callee-named";

export function containsCallNamed(node: RuleNode, names: readonly string[]): boolean {
  if (!isAstNode(node)) {
    return false;
  }

  if (node.type === "CallExpression" && isCalleeNamed(node.callee, names)) {
    return true;
  }

  return getNodeChildren(node).some((child: RuleNode) => containsCallNamed(child, names));
}
