import type { TSESTree } from "@typescript-eslint/utils";
export function getFunctionLineCount(node: TSESTree.Node) {
  return node.loc.end.line - node.loc.start.line + 1;
}
