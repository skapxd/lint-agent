import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import type { FunctionNode } from "#/utils/ast/is-function-node";

export function getFunctionReturnType(node: FunctionNode, typeContext: TypeContext) {
  if (node.returnType?.typeAnnotation) {
    return typeContext.services.getTypeFromTypeNode(node.returnType.typeAnnotation);
  }

  const functionType = typeContext.services.getTypeAtLocation(node);
  const signature = functionType.getCallSignatures()[0];

  return signature?.getReturnType() ?? null;
}
