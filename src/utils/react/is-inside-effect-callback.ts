import type { TSESTree } from "@typescript-eslint/utils";
import { isCalleeNamed } from "#/utils/ast/is-callee-named";
import { isFunctionNode } from "#/utils/ast/is-function-node";

// ¿El nodo vive dentro del callback de un useEffect/useLayoutEffect?
// Cubre también las funciones anidadas (handlers y el cleanup retornado).
export function isInsideEffectCallback(
  node: TSESTree.Node,
  effectNames: readonly string[],
) {
  let current = node.parent;

  while (current) {
    const call = isFunctionNode(current) ? current.parent : null;

    const isEffectCallbackArgument = call?.type === "CallExpression" &&
      call.arguments[0] === current &&
      isCalleeNamed(call.callee, effectNames);
    if (
      isEffectCallbackArgument
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
