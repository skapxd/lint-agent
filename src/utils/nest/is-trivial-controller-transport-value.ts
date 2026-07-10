import type { TSESTree } from "@typescript-eslint/utils";

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
    return expression.elements.every(
      (element) =>
        element !== null &&
        element.type !== "SpreadElement" &&
        isTrivialControllerTransportValue(element),
    );
  }

  const isObjectValue = expression.type === "ObjectExpression";
  if (isObjectValue) {
    return expression.properties.every((property) => {
      const isStaticDataProperty = property.type === "Property" &&
        property.kind === "init" &&
        !property.computed &&
        !property.method &&
        property.value.type !== "AssignmentPattern";

      return isStaticDataProperty &&
        isTrivialControllerTransportValue(property.value);
    });
  }

  return false;
}
