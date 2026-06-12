import type { LegacyAstNode } from "#/utils/rule-types";
export function isMemberPropertyNamed(node: LegacyAstNode, propertyName: LegacyAstNode) {
  if (node.computed) {
    return node.property.type === "Literal" && node.property.value === propertyName;
  }

  return node.property.type === "Identifier" && node.property.name === propertyName;
}
