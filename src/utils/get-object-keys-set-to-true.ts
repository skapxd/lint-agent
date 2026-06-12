import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "./is-ast-node";
import { isPropertyKeyNamed } from "./is-property-key-named";

// Claves de un objeto literal cuyo valor es literalmente `true`.
export function getObjectKeysSetToTrue(
  objectExpression: RuleNode,
  keys: readonly string[],
) {
  return keys.filter((key: string) =>
    objectExpression.properties.some(
      (property: RuleNode) =>
        property.type === "Property" &&
        isPropertyKeyNamed(property, key) &&
        isAstNode(property.value) &&
        property.value.type === "Literal" &&
        property.value.value === true,
    ),
  );
}
