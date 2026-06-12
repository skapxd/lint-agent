import type { LegacyAstNode } from "#/utils/rule-types";
// Extrae los nombres de props destructuradas del primer parámetro de un
// componente: `({ game, variant, ...rest })` → { propNames, restName }.
// Solo cuenta los shorthand (`{ game }`); un rename (`{ game: g }`) se omite.
export function getObjectPatternPropNames(pattern: LegacyAstNode) {
  // Anotado a mano: el tipo inferido del literal mentia (restName quedaba
  // como `null` para siempre y propNames como never[]).
  const result: { propNames: string[]; restName: string | null } = {
    propNames: [],
    restName: null,
  };

  if (pattern?.type !== "ObjectPattern") {
    return result;
  }

  for (const property of pattern.properties) {
    if (property.type === "RestElement" && property.argument.type === "Identifier") {
      result.restName = property.argument.name;
      continue;
    }

    if (
      property.type === "Property" &&
      property.key.type === "Identifier" &&
      property.value.type === "Identifier" &&
      property.key.name === property.value.name
    ) {
      result.propNames.push(property.key.name);
    }
  }

  return result;
}
