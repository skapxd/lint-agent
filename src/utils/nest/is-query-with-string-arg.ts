import type { RuleNode } from "#/utils/rule-authoring/rule-types";
// `@Query('name')` cuenta como query param inline. `@Query()` (recibe el DTO
// completo) y `@Query(MyPipe)` (un solo param consolidado) están bien.
export function isQueryWithStringArg(decorator: RuleNode) {
  const expression = decorator.expression;

  const lacksQueryCallArgument = expression?.type !== "CallExpression" ||
    expression.callee.type !== "Identifier" ||
    expression.callee.name !== "Query" ||
    expression.arguments.length === 0;
  if (
    lacksQueryCallArgument
  ) {
    return false;
  }

  const first = expression.arguments[0];

  return Boolean(first && first.type === "Literal" && typeof first.value === "string");
}
