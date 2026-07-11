import type { TSESTree } from "@typescript-eslint/utils";
// ¿La clase lleva alguno de estos decoradores? Cubre la forma con llamada
// (`@Controller("users")`) y la forma directa (`@Controller`).
export function hasClassDecoratorNamed(
  classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  names: readonly string[],
) {
  function hasConfiguredName(decorator: TSESTree.Decorator) {
    const expression = decorator.expression;
    const callee =
      expression.type === "CallExpression" ? expression.callee : expression;

    return callee.type === "Identifier" && names.includes(callee.name);
  }

  return classNode.decorators.some(hasConfiguredName);
}
