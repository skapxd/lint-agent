import type { LegacyAstNode } from "#/utils/rule-types";
export function isTypeReferenceNamed(node: LegacyAstNode, names: LegacyAstNode) {
  const typeName = node.typeName;

  return typeName.type === "Identifier" && names.includes(typeName.name);
}
