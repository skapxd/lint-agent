import type { TSESTree } from "@typescript-eslint/utils";

export function getStringLiteralValue(node: TSESTree.Node) {
  const isStringLiteral =
    node.type === "Literal" && typeof node.value === "string";
  if (isStringLiteral) {
    return node.value;
  }

  return null;
}
