import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Prueba si una expresión puede salir de una clase como datos estáticos sin
 * capturar ejecución, estado ni referencias externas.
 *
 * ### Contrato
 * ```ts
 * { enabled: true } as const // -> true
 * { enabled: load() }        // -> false
 * ```
 */
export function isJsonCompatibleExpression(node: TSESTree.Node): boolean {
  const isTypeScriptWrapper =
    node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression";
  if (isTypeScriptWrapper) {
    return isJsonCompatibleExpression(node.expression);
  }

  const isLiteralNode = node.type === "Literal";
  if (isLiteralNode) {
    return (
      node.value === null ||
      typeof node.value === "string" ||
      typeof node.value === "boolean" ||
      (typeof node.value === "number" && Number.isFinite(node.value))
    );
  }

  const isUnaryExpressionNode = node.type === "UnaryExpression";
  if (isUnaryExpressionNode) {
    return (
      node.operator === "-" &&
      node.argument.type === "Literal" &&
      typeof node.argument.value === "number" &&
      Number.isFinite(node.argument.value)
    );
  }

  const isArrayExpressionNode = node.type === "ArrayExpression";
  if (isArrayExpressionNode) {
    return node.elements.every(
      (element) => element !== null && isJsonCompatibleExpression(element),
    );
  }

  const lacksObjectExpressionNode = node.type !== "ObjectExpression";
  if (lacksObjectExpressionNode) {
    return false;
  }

  return node.properties.every((property) => {
    const isUnsupportedProperty =
      property.type !== "Property" ||
      property.kind !== "init" ||
      property.method;
    if (isUnsupportedProperty) {
      return false;
    }

    const hasStaticKey =
      !property.computed ||
      (property.key.type === "Literal" &&
        (typeof property.key.value === "string" ||
          typeof property.key.value === "number"));

    return hasStaticKey && isJsonCompatibleExpression(property.value);
  });
}
