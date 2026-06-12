import type { RuleNode } from "#/utils/rule-types";
export function isInsideNode(node: RuleNode, ancestor: RuleNode) {
  let current = node;

  while (current) {
    if (current === ancestor) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
