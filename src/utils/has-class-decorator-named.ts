import type { RuleNode } from "#/utils/rule-types";
// ¿La clase lleva alguno de estos decoradores? Cubre la forma con llamada
// (`@Controller("users")`) y la forma directa (`@Controller`).
export function hasClassDecoratorNamed(classNode: RuleNode, names: readonly string[]) {
  return (classNode.decorators ?? []).some((decorator: RuleNode) => {
    const expression = decorator.expression;
    const callee =
      expression.type === "CallExpression" ? expression.callee : expression;

    return callee.type === "Identifier" && names.includes(callee.name);
  });
}
