import type { TSESTree } from "@typescript-eslint/utils";
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

/**
 * Lee el lado izquierdo de una asignacion y decide que aliases siguen cargando un `Result` completo o su `error` completo. Esto sostiene las reglas de consumo de Result: un destructuring puede preservar el error o puede proyectarlo y perder `cause`.
 *
 * ### Reglas
 * Identificador directo hereda lo que representa la referencia; sobre un Result, `{ error }` representa el error completo y `...rest` representa el Result restante; cualquier otra propiedad (`ok`, `value`) se considera proyeccion y no se sigue.
 *
 * ### Ejemplo
 * ```ts
 * getDeclaredAliasTargets(idOf("const { error } = result"), "result");
 * // -> [{ name: "error", represents: "error" }]
 * getDeclaredAliasTargets(idOf("const { value } = result"), "result"); // -> []
 * ```
 */
export function getDeclaredAliasTargets(
  id: TSESTree.BindingName,
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

  return id.properties.flatMap((property): AliasTarget[] => {
    const isRestElement = property.type === "RestElement";
    if (isRestElement) {
      const argument = property.argument;
      const hasIdentifierArgument = argument.type === "Identifier";

      return hasIdentifierArgument
        ? [{ name: argument.name, represents: "result" }]
        : [];
    }

    const isErrorProperty = isPropertyKeyNamed(property, "error");
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
