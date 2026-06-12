import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isFunctionNode } from "./is-function-node";

export function getContainingFunction(node: RuleNode) {
  let currentNode = node.parent;

  while (currentNode) {
    if (isFunctionNode(currentNode)) {
      return currentNode;
    }

    currentNode = currentNode.parent;
  }

  return null;
}
