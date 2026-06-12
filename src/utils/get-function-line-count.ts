import type { LegacyAstNode } from "#/utils/rule-types";
export function getFunctionLineCount(node: LegacyAstNode) {
  return node.loc ? node.loc.end.line - node.loc.start.line + 1 : 0;
}
