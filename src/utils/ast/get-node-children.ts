import type { TSESTree } from "@typescript-eslint/utils";
import { isAstNode } from "./is-ast-node";

export function getNodeChildren(node: TSESTree.Node): TSESTree.Node[] {
  const children: TSESTree.Node[] = [];
  for (const [key, value] of Object.entries(node)) {
    const includesParentLocRangeTokensComments = [
      "parent",
      "loc",
      "range",
      "tokens",
      "comments",
    ].includes(key);
    if (includesParentLocRangeTokensComments) {
      continue;
    }

    if (Array.isArray(value)) {
      children.push(...value.filter(isAstNode));
      continue;
    }

    if (isAstNode(value)) {
      children.push(value);
    }
  }

  return children;
}
