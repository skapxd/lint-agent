import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getTypeReferenceParameters(node: RuleNode) {
  return node.typeArguments?.params ?? node.typeParameters?.params ?? [];
}
