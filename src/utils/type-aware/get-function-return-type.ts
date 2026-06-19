import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import type { FunctionNode } from "#/utils/ast/is-function-node";

export function getFunctionReturnType(node: FunctionNode, typeContext: TypeContext) {
  // `getTypeAtLocation` + la firma de llamada resuelve el tipo de retorno tanto
  // si esta anotado como si se infiere, y es portable a la version minima del
  // peer (`services.getTypeFromTypeNode` no existe en typescript-eslint 8.24).
  const functionType = typeContext.services.getTypeAtLocation(node);
  const signature = functionType.getCallSignatures()[0];

  return signature?.getReturnType() ?? null;
}
