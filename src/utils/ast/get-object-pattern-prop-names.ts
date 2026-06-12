import type { TSESTree } from "@typescript-eslint/utils";
import { isAstNode } from "./is-ast-node";
// Extrae los nombres de props destructuradas del primer parámetro de un
// componente: `({ game, variant, ...rest })` → { propNames, restName }.
// Solo cuenta los shorthand (`{ game }`); un rename (`{ game: g }`) se omite.
export function getObjectPatternPropNames(pattern: TSESTree.Node) {
  // Anotado a mano: el tipo inferido del literal mentia (restName quedaba
  // como `null` para siempre y propNames como never[]).
  const result: { propNames: string[]; restName: string | null } = {
    propNames: [],
    restName: null,
  };

  const isObjectPatternNode = pattern.type === "ObjectPattern";
  if (!isObjectPatternNode) {
    return result;
  }

  for (const property of pattern.properties) {
    const isRestElement = property.type === "RestElement";
    if (!isRestElement) {
      const key = property.key;
      const value = property.value;
      const isShorthandIdentifierBinding =
        key.type === "Identifier" &&
        isAstNode(value) &&
        value.type === "Identifier" &&
        key.name === value.name;
      const propNames = isShorthandIdentifierBinding ? [key.name] : [];
      result.propNames.push(...propNames);
      continue;
    }

    const argument = property.argument;
    const hasIdentifierArgument = argument.type === "Identifier";
    result.restName = hasIdentifierArgument ? argument.name : result.restName;
  }

  return result;
}
