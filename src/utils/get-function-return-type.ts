// @ts-nocheck
export function getFunctionReturnType(node, typeContext) {
  if (node.returnType?.typeAnnotation) {
    return typeContext.services.getTypeFromTypeNode(node.returnType.typeAnnotation);
  }

  const functionType = typeContext.services.getTypeAtLocation(node);
  const signature = functionType.getCallSignatures()[0];

  return signature?.getReturnType() ?? null;
}
