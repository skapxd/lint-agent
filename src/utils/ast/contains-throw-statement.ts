import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "./get-node-children";
import { isFunctionNode } from "./is-function-node";

// ¿El nodo contiene un throw propio? No cruza funciones anidadas: un throw
// dentro de un callback es de ese callback.
export function containsThrowStatement(node: RuleNode | null): boolean {
  const isThrowStatementNode = node?.type === "ThrowStatement";
  if (isThrowStatementNode) {
    return true;
  }

  const reachedSearchBoundary = !node || isFunctionNode(node);
  if (reachedSearchBoundary) {
    return false;
  }

  return getNodeChildren(node).some((child: RuleNode) => containsThrowStatement(child));
}
