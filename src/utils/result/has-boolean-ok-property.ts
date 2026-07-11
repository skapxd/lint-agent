import type { TSESTree } from "@typescript-eslint/utils";
import { getBooleanLiteralValue } from "#/utils/ast/get-boolean-literal-value";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isPropertyKeyNamed } from "#/utils/ast/is-property-key-named";

// Detecta `{ ok: true }` / `{ ok: false }` (contrato ad hoc tipo Result),
// no `{ ok: res.ok }` (un valor cualquiera, p. ej. un Response de fetch).
export function hasBooleanOkProperty(node: TSESTree.ObjectExpression) {
  for (const property of node.properties) {
    const hasBooleanOk =
      property.type === "Property" &&
      isPropertyKeyNamed(property, "ok") &&
      isAstNode(property.value) &&
      getBooleanLiteralValue(property.value) !== null;
    if (hasBooleanOk) {
      return true;
    }
  }

  return false;
}
