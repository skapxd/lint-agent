import type { LegacyAstNode } from "#/utils/rule-types";
import { isPropertyKeyNamed } from "./is-property-key-named";

// Claves de un objeto literal cuyo valor es literalmente `true`.
export function getObjectKeysSetToTrue(objectExpression: LegacyAstNode, keys: LegacyAstNode) {
  return keys.filter((key: LegacyAstNode) =>
    objectExpression.properties.some(
      (property: LegacyAstNode) =>
        property.type === "Property" &&
        isPropertyKeyNamed(property, key) &&
        property.value.type === "Literal" &&
        property.value.value === true,
    ),
  );
}
