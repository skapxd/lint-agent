// @ts-nocheck
import { isPropertyKeyNamed } from "./is-property-key-named";

// addEventListener(type, listener, options): ¿las options traen `signal`?
// Un identifier o spread como options se acepta (no se puede inspeccionar
// sin tipos; el beneficio de la duda evita falsos positivos).
export function hasAbortSignalOption(callExpression) {
  const options = callExpression.arguments[2];

  if (!options) {
    return false;
  }

  if (options.type !== "ObjectExpression") {
    return true;
  }

  return options.properties.some(
    (property) =>
      property.type === "SpreadElement" ||
      isPropertyKeyNamed(property, "signal"),
  );
}
