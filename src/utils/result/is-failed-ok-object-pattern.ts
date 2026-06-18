import type { TSESTree } from "@typescript-eslint/utils";
import { isObjectPropertyNamed } from "./is-object-property-named";

export function isFailedOkObjectPattern(node: TSESTree.Node | undefined) {
  const hasObjectPatternShape = node?.type === "ObjectExpression";
  if (!hasObjectPatternShape) {
    return false;
  }

  return node.properties.some((property: TSESTree.Node) => {
    const isOkProperty = property.type === "Property" &&
      isObjectPropertyNamed(property, "ok");
    const hasFalseValue = property.type === "Property" &&
      property.value.type === "Literal" &&
      property.value.value === false;

    return isOkProperty && hasFalseValue;
  });
}
