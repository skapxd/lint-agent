import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isPropertyKeyNamed } from "#/utils/ast/is-property-key-named";

// ¿El objeto literal de options trae `signal`? Un spread dentro del objeto
// recibe el beneficio de la duda (puede aportar el signal).
export function objectExpressionHasSignal(objectExpression: RuleNode) {
  return objectExpression.properties.some(
    (property: RuleNode) =>
      property.type === "SpreadElement" ||
      isPropertyKeyNamed(property, "signal"),
  );
}
