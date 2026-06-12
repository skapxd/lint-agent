import type { LegacyAstNode } from "#/utils/rule-types";
// Resuelve un Identifier hasta el inicializador de su declaración subiendo
// por la cadena de scopes (`const opts = {...}` → el ObjectExpression).
// Devuelve null si la variable no se declara aquí (parámetro, import).
export function getVariableInitializer(identifier: LegacyAstNode, scope: LegacyAstNode) {
  let current = scope;

  while (current) {
    const variable = current.variables.find(
      (candidate: LegacyAstNode) => candidate.name === identifier.name,
    );

    if (variable) {
      const definition = variable.defs[0];

      return definition?.node?.type === "VariableDeclarator"
        ? definition.node.init
        : null;
    }

    current = current.upper;
  }

  return null;
}
