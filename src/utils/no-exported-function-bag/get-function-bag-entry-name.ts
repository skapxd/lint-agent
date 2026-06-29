import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "#/utils/ast/get-property-name";

export function getFunctionBagEntryName(property: TSESTree.Property) {
  const hasComputedName = property.computed;
  if (hasComputedName) {
    return "[computed]";
  }

  return getPropertyName(property.key);
}
