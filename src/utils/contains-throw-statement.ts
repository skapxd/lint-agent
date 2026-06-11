// @ts-nocheck
import { getNodeChildren } from "./get-node-children";
import { isFunctionNode } from "./is-function-node";

// ¿El nodo contiene un throw propio? No cruza funciones anidadas: un throw
// dentro de un callback es de ese callback.
export function containsThrowStatement(node) {
  if (node?.type === "ThrowStatement") {
    return true;
  }

  if (!node || isFunctionNode(node)) {
    return false;
  }

  return getNodeChildren(node).some((child) => containsThrowStatement(child));
}
