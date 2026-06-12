import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "#/utils/get-node-children";
import { isAstNode } from "#/utils/is-ast-node";
import { isFunctionNode } from "#/utils/is-function-node";

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
