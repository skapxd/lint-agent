import type { TSESTree } from "@typescript-eslint/utils";
import { isPropertyKeyNamed } from "#/utils/ast/is-property-key-named";

// ¿El objeto literal de options trae `signal`? Un spread dentro del objeto
// recibe el beneficio de la duda (puede aportar el signal).
export function objectExpressionHasSignal(objectExpression: TSESTree.ObjectExpression) {
  return objectExpression.properties.some(
    (property) =>
      property.type === "SpreadElement" ||
      isPropertyKeyNamed(property, "signal"),
  );
}
