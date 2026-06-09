// @ts-nocheck
export function getTypeReferenceParameters(node) {
  return node.typeArguments?.params ?? node.typeParameters?.params ?? [];
}
