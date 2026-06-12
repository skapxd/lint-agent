import type { LegacyAstNode } from "#/utils/rule-types";
export function getTypeReferenceParameters(node: LegacyAstNode) {
  return node.typeArguments?.params ?? node.typeParameters?.params ?? [];
}
