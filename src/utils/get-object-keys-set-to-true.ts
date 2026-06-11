// @ts-nocheck
import { isPropertyKeyNamed } from "./is-property-key-named";

// Claves de un objeto literal cuyo valor es literalmente `true`.
export function getObjectKeysSetToTrue(objectExpression, keys) {
  return keys.filter((key) =>
    objectExpression.properties.some(
      (property) =>
        property.type === "Property" &&
        isPropertyKeyNamed(property, key) &&
        property.value.type === "Literal" &&
        property.value.value === true,
    ),
  );
}
