import type { TSESTree } from "@typescript-eslint/utils";
import { isAstNode } from "./is-ast-node";
import { isPropertyKeyNamed } from "./is-property-key-named";

// Claves de un objeto literal cuyo valor es literalmente `true`.
export function getObjectKeysSetToTrue(
  objectExpression: TSESTree.ObjectExpression,
  keys: readonly string[],
) {
  function isKeySetToTrue(key: string) {
    function isMatchingTrueProperty(property: TSESTree.ObjectLiteralElement) {
      return (
        property.type === "Property" &&
        isPropertyKeyNamed(property, key) &&
        isAstNode(property.value) &&
        property.value.type === "Literal" &&
        property.value.value === true
      );
    }

    return objectExpression.properties.some(isMatchingTrueProperty);
  }

  return keys.filter(isKeySetToTrue);
}
