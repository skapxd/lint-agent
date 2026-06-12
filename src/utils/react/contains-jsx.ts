import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "#/utils/get-node-children";
import { isAstNode } from "#/utils/is-ast-node";

export function containsJsx(node: RuleNode): boolean {
  if (!isAstNode(node)) {
    return false;
  }

  if (node.type === "JSXElement" || node.type === "JSXFragment") {
    return true;
  }

  return getNodeChildren(node).some((child: RuleNode) => containsJsx(child));
}
