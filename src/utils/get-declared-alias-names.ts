// @ts-nocheck
// Nombres que declara el lado izquierdo de un `const x = ...`:
// Identifier directo, o los bindings de un destructuring plano
// (`const { error } = r`, `const { error: e } = r`, rest incluido).
export function getDeclaredAliasNames(id) {
  if (id.type === "Identifier") {
    return [id.name];
  }

  if (id.type !== "ObjectPattern") {
    return [];
  }

  return id.properties.flatMap((property) => {
    if (property.type === "RestElement" && property.argument.type === "Identifier") {
      return [property.argument.name];
    }

    if (property.type === "Property" && property.value.type === "Identifier") {
      return [property.value.name];
    }

    return [];
  });
}
