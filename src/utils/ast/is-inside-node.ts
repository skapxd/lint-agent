import type { TSESTree } from "@typescript-eslint/utils";
export function isInsideNode(node: TSESTree.Node, ancestor: TSESTree.Node) {
  let current: TSESTree.Node | undefined = node;

  while (current) {
    const isCurrentAncestor = current === ancestor;
    if (isCurrentAncestor) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
