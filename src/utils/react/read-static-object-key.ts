import type { TSESTree } from "@typescript-eslint/utils";
import { getStringLiteralValue } from "#/utils/react/get-string-literal-value";

export function readStaticObjectKey(key: TSESTree.Property["key"]) {
  const literalValue = getStringLiteralValue(key);
  if (literalValue !== null) {
    return literalValue;
  }

  const isIdentifierKey = key.type === "Identifier";
  if (isIdentifierKey) {
    return key.name;
  }

  return null;
}
