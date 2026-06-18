import type { TSESTree } from "@typescript-eslint/utils";

export function isObjectPropertyNamed(
  property: TSESTree.Property,
  name: string,
) {
  const key = property.key;
  const hasIdentifierKey = key.type === "Identifier" && key.name === name;
  const hasLiteralKey = key.type === "Literal" && key.value === name;

  return hasIdentifierKey || hasLiteralKey;
}
