import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { isAstNode } from "#/utils/ast/is-ast-node";

export function containsJsx(node: TSESTree.Node): boolean {
  if (!isAstNode(node)) {
    return false;
  }

  const isJsxNode = node.type === "JSXElement" || node.type === "JSXFragment";
  if (isJsxNode) {
    return true;
  }

  return getNodeChildren(node).some((child: TSESTree.Node) => containsJsx(child));
}
