import type { RuleNode } from "#/utils/rule-types";
export function getFunctionNodeName(node: RuleNode) {
  return node.id?.name ?? "helper";
}
