import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isFunctionNode } from "./is-function-node";

// ¿Este if vive dentro de otro if de la MISMA función? El eslabón directo de
// un `else if` no cuenta (es cadena, no anidación) — si la cadena entera está
// dentro de otro if, el reporte cae sobre su cabeza, una sola vez. Una
// función definida dentro de un if es una unidad cognitiva aparte.
export function isNestedIfStatement(node: RuleNode) {
  const isElseIfBranch = node.parent?.type === "IfStatement" && node.parent.alternate === node;
  if (isElseIfBranch) {
    return false;
  }

  let current = node.parent;

  while (current && !isFunctionNode(current)) {
    const isIfStatementNode = current.type === "IfStatement";
    if (isIfStatementNode) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
