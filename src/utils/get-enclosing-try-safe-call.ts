// @ts-nocheck
import { isCalleeNamed } from "./is-callee-named";
import { isFunctionNode } from "./is-function-node";

// Si el nodo está dentro de un callback pasado a `trySafe(...)`, devuelve esa
// CallExpression (para poder verificar su símbolo); si no, null.
export function getEnclosingTrySafeCall(node, trySafeCallNames) {
  let currentNode = node.parent;

  while (currentNode) {
    if (isFunctionNode(currentNode)) {
      const parent = currentNode.parent;

      if (
        parent?.type === "CallExpression" &&
        parent.arguments.includes(currentNode) &&
        isCalleeNamed(parent.callee, trySafeCallNames)
      ) {
        return parent;
      }

      return null;
    }

    currentNode = currentNode.parent;
  }

  return null;
}
