import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "./get-node-children";

// Busca en la condición de un if una referencia a `this.<propiedad>`
// (directa, negada o comparada) y devuelve el nombre de la propiedad.
export function getThisPropertyInTest(node: RuleNode): string | null {
  if (
    node?.type === "MemberExpression" &&
    node.object?.type === "ThisExpression" &&
    node.property?.type === "Identifier"
  ) {
    return node.property.name;
  }

  for (const child of getNodeChildren(node)) {
    const found = getThisPropertyInTest(child);

    if (found) {
      return found;
    }
  }

  return null;
}
