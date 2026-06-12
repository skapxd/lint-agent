import type { RuleNode } from "#/utils/rule-authoring/rule-types";
// Nombre de un decorador, con llamada (`@ApiProperty({...})`) o sin ella
// (`@ApiExcludeEndpoint`).
export function getDecoratorName(decorator: RuleNode) {
  const expression = decorator.expression;
  const callee =
    expression.type === "CallExpression" ? expression.callee : expression;

  return callee.type === "Identifier" ? callee.name : null;
}
