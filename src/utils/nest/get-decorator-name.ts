import type { TSESTree } from "@typescript-eslint/utils";
// Nombre de un decorador, con llamada (`@ApiProperty({...})`) o sin ella
// (`@ApiExcludeEndpoint`).
export function getDecoratorName(decorator: TSESTree.Decorator) {
  const expression = decorator.expression;
  const callee =
    expression.type === "CallExpression" ? expression.callee : expression;

  return callee.type === "Identifier" ? callee.name : null;
}
