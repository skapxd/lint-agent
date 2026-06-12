import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function isPropertyKeyNamed(property: RuleNode, propertyName: string) {
  if (property.key.type === "Identifier") {
    return property.key.name === propertyName;
  }

  return property.key.type === "Literal" && property.key.value === propertyName;
}
