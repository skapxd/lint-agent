import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "./is-ast-node";
// Extrae los nombres de props destructuradas del primer parámetro de un
// componente: `({ game, variant, ...rest })` → { propNames, restName }.
// Solo cuenta los shorthand (`{ game }`); un rename (`{ game: g }`) se omite.
export function getObjectPatternPropNames(pattern: RuleNode) {
  // Anotado a mano: el tipo inferido del literal mentia (restName quedaba
  // como `null` para siempre y propNames como never[]).
  const result: { propNames: string[]; restName: string | null } = {
    propNames: [],
    restName: null,
  };

  const isObjectPatternNode = pattern?.type === "ObjectPattern";
  if (!isObjectPatternNode) {
    return result;
  }

  for (const property of pattern.properties) {
    const isRestIdentifierBinding = property.type === "RestElement" && property.argument.type === "Identifier";
    if (isRestIdentifierBinding) {
      result.restName = property.argument.name;
      continue;
    }

    const isShorthandIdentifierBinding = property.type === "Property" &&
      property.key.type === "Identifier" &&
      isAstNode(property.value) &&
      property.value.type === "Identifier" &&
      property.key.name === property.value.name;
    if (
      isShorthandIdentifierBinding
    ) {
      result.propNames.push(property.key.name);
    }
  }

  return result;
}
