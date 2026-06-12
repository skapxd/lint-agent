import type { TSESTree } from "@typescript-eslint/utils";
import { isAstNode } from "./is-ast-node";

export function getNodeChildren(node: TSESTree.Node): TSESTree.Node[] {
  return Object.entries(node).flatMap(([key, value]: [string, unknown]) => {
    const includesParentLocRangeTokensComments = ["parent", "loc", "range", "tokens", "comments"].includes(key);
    if (includesParentLocRangeTokensComments) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter(isAstNode);
    }

    return isAstNode(value) ? [value] : [];
  });
}
