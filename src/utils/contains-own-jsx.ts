import type { RuleNode } from "#/utils/rule-types";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";
import { isFunctionNode } from "./is-function-node";

export function containsOwnJsx(node: RuleNode): boolean {
  if (!isAstNode(node)) {
    return false;
  }

  if (node.type === "JSXElement" || node.type === "JSXFragment") {
    return true;
  }

  if (isFunctionNode(node)) {
    return false;
  }

  return getNodeChildren(node).some((child: RuleNode) => containsOwnJsx(child));
}
