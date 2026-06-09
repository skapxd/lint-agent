// @ts-nocheck
import { isFunctionNode } from "./is-function-node";

export function getContainingFunction(node) {
  let currentNode = node.parent;

  while (currentNode) {
    if (isFunctionNode(currentNode)) {
      return currentNode;
    }

    currentNode = currentNode.parent;
  }

  return null;
}
