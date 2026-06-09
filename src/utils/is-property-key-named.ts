// @ts-nocheck
export function isPropertyKeyNamed(property, propertyName) {
  if (property.key.type === "Identifier") {
    return property.key.name === propertyName;
  }

  return property.key.type === "Literal" && property.key.value === propertyName;
}
