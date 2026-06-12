import type { TSESTree } from "@typescript-eslint/utils";
import { isCalleeNamed } from "#/utils/ast/is-callee-named";
import { isFunctionNode } from "#/utils/ast/is-function-node";

// Si el nodo está dentro de un callback pasado a `trySafe(...)`, devuelve esa
// CallExpression (para poder verificar su símbolo); si no, null.
export function getEnclosingTrySafeCall(
  node: TSESTree.Node,
  trySafeCallNames: readonly string[],
): TSESTree.CallExpression | null {
  let currentNode = node.parent;

  while (currentNode) {
    if (!isFunctionNode(currentNode)) {
      currentNode = currentNode.parent;
      continue;
    }

    const callbackNode = currentNode.type === "FunctionDeclaration" ? null : currentNode;
    if (!callbackNode) {
      return null;
    }

    const parent = callbackNode.parent;
    const isTrySafeArgument =
      parent.type === "CallExpression" &&
      parent.arguments.includes(callbackNode) &&
      isCalleeNamed(parent.callee, trySafeCallNames);

    return isTrySafeArgument ? parent : null;
  }

  return null;
}
