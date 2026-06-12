import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "./is-ast-node";

export function getNodeChildren(node: RuleNode): RuleNode[] {
  return Object.entries(node).flatMap(([key, value]: [string, unknown]) => {
    if (["parent", "loc", "range", "tokens", "comments"].includes(key)) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter(isAstNode);
    }

    return isAstNode(value) ? [value] : [];
  });
}
