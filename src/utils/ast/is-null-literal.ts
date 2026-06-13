import type { TSESTree } from "@typescript-eslint/utils";

export function isNullLiteral(node: TSESTree.Node | null) {
  return node?.type === "Literal" && node.value === null;
}
