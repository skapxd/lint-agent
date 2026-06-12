import type { LegacyAstNode } from "#/utils/rule-types";
export function isPropertyKeyNamed(property: LegacyAstNode, propertyName: LegacyAstNode) {
  if (property.key.type === "Identifier") {
    return property.key.name === propertyName;
  }

  return property.key.type === "Literal" && property.key.value === propertyName;
}
