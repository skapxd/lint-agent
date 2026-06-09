// @ts-nocheck
import { getBooleanLiteralValue } from "./get-boolean-literal-value";
import { isPropertyKeyNamed } from "./is-property-key-named";

// Detecta `{ ok: true }` / `{ ok: false }` (contrato ad hoc tipo Result),
// no `{ ok: res.ok }` (un valor cualquiera, p. ej. un Response de fetch).
export function hasBooleanOkProperty(node) {
  return node.properties.some(
    (property) =>
      property.type === "Property" &&
      isPropertyKeyNamed(property, "ok") &&
      getBooleanLiteralValue(property.value) !== null,
  );
}
