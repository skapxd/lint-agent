import type { TSESTree } from "@typescript-eslint/utils";

export function hasStringFieldArgument(decorator: TSESTree.Decorator) {
  const expression = decorator.expression;
  const lacksCallExpression = expression.type !== "CallExpression";
  if (lacksCallExpression) {
    return false;
  }

  const [firstArgument] = expression.arguments;
  if (!firstArgument) {
    return false;
  }

  const isStringLiteral = firstArgument.type === "Literal" &&
    typeof firstArgument.value === "string";
  const isTemplateLiteral = firstArgument.type === "TemplateLiteral" &&
    firstArgument.expressions.length === 0;

  return isStringLiteral || isTemplateLiteral;
}
