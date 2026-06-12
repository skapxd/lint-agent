import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "./get-node-children";

// Busca en la condición de un if una referencia a `this.<propiedad>`
// (directa, negada o comparada) y devuelve el nombre de la propiedad.
export function getThisPropertyInTest(node: TSESTree.Node): string | null {
  const property = node.type === "MemberExpression" ? node.property : null;
  const isThisPropertyRead = node.type === "MemberExpression" &&
    node.object.type === "ThisExpression" &&
    property?.type === "Identifier";
  if (
    isThisPropertyRead
  ) {
    return property.name;
  }

  for (const child of getNodeChildren(node)) {
    const found = getThisPropertyInTest(child);

    if (found) {
      return found;
    }
  }

  return null;
}
