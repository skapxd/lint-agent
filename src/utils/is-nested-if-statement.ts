import type { RuleNode } from "#/utils/rule-types";
import { isFunctionNode } from "./is-function-node";

// ¿Este if vive dentro de otro if de la MISMA función? El eslabón directo de
// un `else if` no cuenta (es cadena, no anidación) — si la cadena entera está
// dentro de otro if, el reporte cae sobre su cabeza, una sola vez. Una
// función definida dentro de un if es una unidad cognitiva aparte.
export function isNestedIfStatement(node: RuleNode) {
  if (node.parent?.type === "IfStatement" && node.parent.alternate === node) {
    return false;
  }

  let current = node.parent;

  while (current && !isFunctionNode(current)) {
    if (current.type === "IfStatement") {
      return true;
    }

    current = current.parent;
  }

  return false;
}
