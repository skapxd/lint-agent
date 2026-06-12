import type { LegacyAstNode } from "#/utils/rule-types";
import { isAstNode } from "./is-ast-node";

export function getNodeChildren(node: LegacyAstNode) {
  return Object.entries(node).flatMap(([key, value]: LegacyAstNode) => {
    if (["parent", "loc", "range", "tokens", "comments"].includes(key)) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter(isAstNode);
    }

    return isAstNode(value) ? [value] : [];
  });
}
