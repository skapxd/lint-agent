// @ts-nocheck
// `@Query('name')` cuenta como query param inline. `@Query()` (recibe el DTO
// completo) y `@Query(MyPipe)` (un solo param consolidado) están bien.
export function isQueryWithStringArg(decorator) {
  const expression = decorator.expression;

  if (
    expression?.type !== "CallExpression" ||
    expression.callee.type !== "Identifier" ||
    expression.callee.name !== "Query" ||
    expression.arguments.length === 0
  ) {
    return false;
  }

  const first = expression.arguments[0];

  return first.type === "Literal" && typeof first.value === "string";
}
