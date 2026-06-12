import type { LegacyAstNode } from "#/utils/rule-types";
export function getFunctionReturnType(node: LegacyAstNode, typeContext: LegacyAstNode) {
  if (node.returnType?.typeAnnotation) {
    return typeContext.services.getTypeFromTypeNode(node.returnType.typeAnnotation);
  }

  const functionType = typeContext.services.getTypeAtLocation(node);
  const signature = functionType.getCallSignatures()[0];

  return signature?.getReturnType() ?? null;
}
