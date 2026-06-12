import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";
import { isCalleeNamed } from "./is-callee-named";

export function containsCallNamed(node: TSESTree.Node, names: readonly string[]): boolean {
  if (!isAstNode(node)) {
    return false;
  }

  const isNamedCallExpression = node.type === "CallExpression" && isCalleeNamed(node.callee, names);
  if (isNamedCallExpression) {
    return true;
  }

  return getNodeChildren(node).some((child: TSESTree.Node) => containsCallNamed(child, names));
}
