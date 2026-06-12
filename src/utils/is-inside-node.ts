import type { LegacyAstNode } from "#/utils/rule-types";
export function isInsideNode(node: LegacyAstNode, ancestor: LegacyAstNode) {
  let current = node;

  while (current) {
    if (current === ancestor) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
