import type { LegacyAstNode } from "#/utils/rule-types";
import { isCalleeNamed } from "./is-callee-named";
import { isFunctionNode } from "./is-function-node";

// ¿El nodo vive dentro del callback de un useEffect/useLayoutEffect?
// Cubre también las funciones anidadas (handlers y el cleanup retornado).
export function isInsideEffectCallback(node: LegacyAstNode, effectNames: LegacyAstNode) {
  let current = node.parent;

  while (current) {
    const call = isFunctionNode(current) ? current.parent : null;

    if (
      call?.type === "CallExpression" &&
      call.arguments[0] === current &&
      isCalleeNamed(call.callee, effectNames)
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
