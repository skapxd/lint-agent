import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function isTypeReferenceNamed(node: RuleNode, names: readonly string[]) {
  const typeName = node.typeName;

  return typeName.type === "Identifier" && names.includes(typeName.name);
}
