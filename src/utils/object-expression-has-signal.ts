// @ts-nocheck
import { isPropertyKeyNamed } from "./is-property-key-named";

// ¿El objeto literal de options trae `signal`? Un spread dentro del objeto
// recibe el beneficio de la duda (puede aportar el signal).
export function objectExpressionHasSignal(objectExpression) {
  return objectExpression.properties.some(
    (property) =>
      property.type === "SpreadElement" ||
      isPropertyKeyNamed(property, "signal"),
  );
}
