import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "./get-property-name";

export function isPropertyKeyNamed(property: TSESTree.Node, propertyName: string) {
  const isPropertyLikeNode =
    property.type === "MethodDefinition" ||
    property.type === "Property" ||
    property.type === "PropertyDefinition" ||
    property.type === "TSPropertySignature";
  if (!isPropertyLikeNode) {
    return false;
  }

  return getPropertyName(property.key) === propertyName;
}
