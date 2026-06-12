import type { TSESTree } from "@typescript-eslint/utils";
import { isFunctionNode, type FunctionNode } from "./is-function-node";

export function getContainingFunction(node: TSESTree.Node): FunctionNode | null {
  let currentNode = node.parent;

  while (currentNode) {
    if (isFunctionNode(currentNode)) {
      return currentNode;
    }

    currentNode = currentNode.parent;
  }

  return null;
}
