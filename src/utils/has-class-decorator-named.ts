// @ts-nocheck
// ¿La clase lleva alguno de estos decoradores? Cubre la forma con llamada
// (`@Controller("users")`) y la forma directa (`@Controller`).
export function hasClassDecoratorNamed(classNode, names) {
  return (classNode.decorators ?? []).some((decorator) => {
    const expression = decorator.expression;
    const callee =
      expression.type === "CallExpression" ? expression.callee : expression;

    return callee.type === "Identifier" && names.includes(callee.name);
  });
}
