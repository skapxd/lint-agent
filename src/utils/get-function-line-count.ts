import type { RuleNode } from "#/utils/rule-types";
export function getFunctionLineCount(node: RuleNode) {
  return node.loc ? node.loc.end.line - node.loc.start.line + 1 : 0;
}
