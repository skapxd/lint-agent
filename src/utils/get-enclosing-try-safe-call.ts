import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isCalleeNamed } from "./is-callee-named";
import { isFunctionNode } from "./is-function-node";

// Si el nodo está dentro de un callback pasado a `trySafe(...)`, devuelve esa
// CallExpression (para poder verificar su símbolo); si no, null.
export function getEnclosingTrySafeCall(node: RuleNode, trySafeCallNames: readonly string[]) {
  let currentNode = node.parent;

  while (currentNode) {
    if (!isFunctionNode(currentNode)) {
      currentNode = currentNode.parent;
      continue;
    }

    const parent = currentNode.parent;
    const isTrySafeArgument =
      parent?.type === "CallExpression" &&
      parent.arguments.includes(currentNode) &&
      isCalleeNamed(parent.callee, trySafeCallNames);

    return isTrySafeArgument ? parent : null;
  }

  return null;
}
