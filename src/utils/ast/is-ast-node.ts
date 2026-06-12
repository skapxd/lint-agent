import type { TSESTree } from "@typescript-eslint/utils";
export function isAstNode(value: unknown): value is TSESTree.Node {
  return Boolean(value && typeof value === "object" && "type" in value);
}
