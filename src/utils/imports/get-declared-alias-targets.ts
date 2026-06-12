import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isPropertyKeyNamed } from "#/utils/ast/is-property-key-named";

// Bindings que declara el lado izquierdo de un `const x = ...` y QUÉ
// representa cada uno. Si lo asignado es el error, un destructuring lo
// proyecta (pierde el cause) y no produce targets. Si es el result:
// `{ error }` sigue como error, `...rest` sigue como result (aún lo carga),
// y los demás bindings (`ok`, `value`) son proyecciones que no se siguen.
type AliasTarget = {
  name: string;
  represents: "error" | "result";
};

export function getDeclaredAliasTargets(
  id: RuleNode,
  represents: "error" | "result",
): AliasTarget[] {
  const isIdentifierNode = id.type === "Identifier";
  if (isIdentifierNode) {
    return [{ name: id.name, represents }];
  }

  const lacksResultObjectPattern = id.type !== "ObjectPattern" || represents !== "result";
  if (lacksResultObjectPattern) {
    return [];
  }

  return id.properties.flatMap((property: RuleNode): AliasTarget[] => {
    const isRestResultAlias = property.type === "RestElement" && property.argument.type === "Identifier";
    if (isRestResultAlias) {
      return [{ name: property.argument.name, represents: "result" }];
    }

    const isErrorProperty =
      property.type === "Property" && isPropertyKeyNamed(property, "error");
    if (!isErrorProperty) {
      return [];
    }

    const propertyValue = property.value;
    const isIdentifierErrorBinding =
      isAstNode(propertyValue) && propertyValue.type === "Identifier";
    if (!isIdentifierErrorBinding) {
      return [];
    }

    return [{ name: propertyValue.name, represents: "error" }];
  });
}
