import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function isInsideNode(node: RuleNode, ancestor: RuleNode) {
  let current = node;

  while (current) {
    const isCurrentAncestor = current === ancestor;
    if (isCurrentAncestor) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
