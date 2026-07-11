import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Decide si un valor de transporte puede cruzar directamente del controller al caso de uso sin esconder trabajo de dominio ni transformaciones.
 *
 * ### Contrato
 * ```ts
 * req.user.id              // true
 * { id: req.user.id }      // true
 * await mapRequest(req)    // false
 * ```
 */
export function isTrivialControllerTransportValue(
  expression: TSESTree.Node,
): boolean {
  const isDirectTransportValue = expression.type === "Identifier" ||
    expression.type === "Literal";
  if (isDirectTransportValue) {
    return true;
  }

  const isPropertyAccess = expression.type === "MemberExpression";
  if (isPropertyAccess) {
    const hasStaticProperty = !expression.computed &&
      !expression.optional &&
      expression.property.type === "Identifier" &&
      expression.object.type !== "Super";

    return hasStaticProperty &&
      isTrivialControllerTransportValue(expression.object);
  }

  const isArrayValue = expression.type === "ArrayExpression";
  if (isArrayValue) {
    let hasOnlyTrivialElements = true;
    for (const element of expression.elements) {
      const isTrivialElement =
        element !== null &&
        element.type !== "SpreadElement" &&
        isTrivialControllerTransportValue(element);
      hasOnlyTrivialElements &&= isTrivialElement;
    }

    return hasOnlyTrivialElements;
  }

  const isObjectValue = expression.type === "ObjectExpression";
  if (isObjectValue) {
    let hasOnlyTrivialProperties = true;
    for (const property of expression.properties) {
      const isStaticDataProperty = property.type === "Property" &&
        property.kind === "init" &&
        !property.computed &&
        !property.method &&
        property.value.type !== "AssignmentPattern";

      const isTrivialProperty = isStaticDataProperty &&
        isTrivialControllerTransportValue(property.value);
      hasOnlyTrivialProperties &&= isTrivialProperty;
    }

    return hasOnlyTrivialProperties;
  }

  return false;
}
