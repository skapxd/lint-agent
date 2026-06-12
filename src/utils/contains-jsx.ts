import type { LegacyAstNode } from "#/utils/rule-types";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";

export function containsJsx(node: LegacyAstNode): LegacyAstNode {
  if (!isAstNode(node)) {
    return false;
  }

  if (node.type === "JSXElement" || node.type === "JSXFragment") {
    return true;
  }

  return getNodeChildren(node).some((child: LegacyAstNode) => containsJsx(child));
}
