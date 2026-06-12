import type { RuleNode } from "#/utils/rule-types";
export function getTypeReferenceParameters(node: RuleNode) {
  return node.typeArguments?.params ?? node.typeParameters?.params ?? [];
}
