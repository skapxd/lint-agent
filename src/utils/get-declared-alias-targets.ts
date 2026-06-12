import type { LegacyAstNode } from "#/utils/rule-types";
import { isPropertyKeyNamed } from "./is-property-key-named";

// Bindings que declara el lado izquierdo de un `const x = ...` y QUÉ
// representa cada uno. Si lo asignado es el error, un destructuring lo
// proyecta (pierde el cause) y no produce targets. Si es el result:
// `{ error }` sigue como error, `...rest` sigue como result (aún lo carga),
// y los demás bindings (`ok`, `value`) son proyecciones que no se siguen.
export function getDeclaredAliasTargets(id: LegacyAstNode, represents: LegacyAstNode) {
  if (id.type === "Identifier") {
    return [{ name: id.name, represents }];
  }

  if (id.type !== "ObjectPattern" || represents !== "result") {
    return [];
  }

  return id.properties.flatMap((property: LegacyAstNode) => {
    if (property.type === "RestElement" && property.argument.type === "Identifier") {
      return [{ name: property.argument.name, represents: "result" }];
    }

    if (
      property.type === "Property" &&
      isPropertyKeyNamed(property, "error") &&
      property.value.type === "Identifier"
    ) {
      return [{ name: property.value.name, represents: "error" }];
    }

    return [];
  });
}
