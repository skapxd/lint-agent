// @ts-nocheck
export function isMemberPropertyNamed(node, propertyName) {
  if (node.computed) {
    return node.property.type === "Literal" && node.property.value === propertyName;
  }

  return node.property.type === "Identifier" && node.property.name === propertyName;
}
