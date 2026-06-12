import type { LegacyAstNode } from "#/utils/rule-types";
import { getBooleanLiteralValue } from "./get-boolean-literal-value";
import { isPropertyKeyNamed } from "./is-property-key-named";

// Detecta `{ ok: true }` / `{ ok: false }` (contrato ad hoc tipo Result),
// no `{ ok: res.ok }` (un valor cualquiera, p. ej. un Response de fetch).
export function hasBooleanOkProperty(node: LegacyAstNode) {
  return node.properties.some(
    (property: LegacyAstNode) =>
      property.type === "Property" &&
      isPropertyKeyNamed(property, "ok") &&
      getBooleanLiteralValue(property.value) !== null,
  );
}
