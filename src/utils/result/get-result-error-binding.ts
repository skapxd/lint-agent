import type { TSESTree } from "@typescript-eslint/utils";
import { getIdentifierFromPattern } from "./get-identifier-from-pattern";
import { isObjectPropertyNamed } from "./is-object-property-named";

export function getResultErrorBinding(pattern: TSESTree.ObjectPattern) {
  for (const property of pattern.properties) {
    const isPatternProperty = property.type === "Property";
    if (!isPatternProperty) {
      continue;
    }

    const isErrorProperty = isObjectPropertyNamed(property, "error");
    if (!isErrorProperty) {
      continue;
    }

    return getIdentifierFromPattern(property.value);
  }

  return null;
}
