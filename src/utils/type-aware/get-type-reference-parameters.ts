import type { TSESTree } from "@typescript-eslint/utils";
export function getTypeReferenceParameters(node: TSESTree.TSTypeReference) {
  return node.typeArguments?.params ?? [];
}
