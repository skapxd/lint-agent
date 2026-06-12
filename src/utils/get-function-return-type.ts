import type { RuleNode, TypeContext } from "#/utils/rule-authoring/rule-types";
export function getFunctionReturnType(node: RuleNode, typeContext: TypeContext) {
  if (node.returnType?.typeAnnotation) {
    return typeContext.services.getTypeFromTypeNode(node.returnType.typeAnnotation);
  }

  const functionType = typeContext.services.getTypeAtLocation(node);
  const signature = functionType.getCallSignatures()[0];

  return signature?.getReturnType() ?? null;
}
