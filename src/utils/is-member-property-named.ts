import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function isMemberPropertyNamed(node: RuleNode, propertyName: string) {
  if (node.computed) {
    return node.property.type === "Literal" && node.property.value === propertyName;
  }

  return node.property.type === "Identifier" && node.property.name === propertyName;
}
