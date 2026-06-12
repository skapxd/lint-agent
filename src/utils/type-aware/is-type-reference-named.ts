import type { TSESTree } from "@typescript-eslint/utils";
export function isTypeReferenceNamed(node: TSESTree.TSTypeReference, names: readonly string[]) {
  const typeName = node.typeName;

  return typeName.type === "Identifier" && names.includes(typeName.name);
}
