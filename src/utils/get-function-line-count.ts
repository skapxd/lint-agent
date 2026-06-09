// @ts-nocheck
export function getFunctionLineCount(node) {
  return node.loc ? node.loc.end.line - node.loc.start.line + 1 : 0;
}
