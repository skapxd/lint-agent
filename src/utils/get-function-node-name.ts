import type { LegacyAstNode } from "#/utils/rule-types";
export function getFunctionNodeName(node: LegacyAstNode) {
  return node.id?.name ?? "helper";
}
