import type { TSESTree } from "@typescript-eslint/utils";

export function getExportedIdentifierName(
  name: TSESTree.Identifier | TSESTree.StringLiteral,
) {
  return name.type === "Identifier" ? name.name : name.value;
}
