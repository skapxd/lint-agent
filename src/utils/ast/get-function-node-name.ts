import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getFunctionNodeName(node: RuleNode) {
  return node.id?.name ?? "helper";
}
