// @ts-nocheck
import { isAstNode } from "./is-ast-node";

export function getNodeChildren(node) {
  return Object.entries(node).flatMap(([key, value]) => {
    if (["parent", "loc", "range", "tokens", "comments"].includes(key)) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter(isAstNode);
    }

    return isAstNode(value) ? [value] : [];
  });
}
