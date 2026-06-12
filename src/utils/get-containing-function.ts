import type { LegacyAstNode } from "#/utils/rule-types";
import { isFunctionNode } from "./is-function-node";

export function getContainingFunction(node: LegacyAstNode) {
  let currentNode = node.parent;

  while (currentNode) {
    if (isFunctionNode(currentNode)) {
      return currentNode;
    }

    currentNode = currentNode.parent;
  }

  return null;
}
