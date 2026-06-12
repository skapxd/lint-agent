import { getFunctionNodeName } from "./get-function-node-name";
import { getParentFunctionName } from "./get-parent-function-name";
import type { FunctionNode } from "./is-function-node";

export function getFunctionName(node: FunctionNode) {
  const isFunctionDeclarationNode = node.type === "FunctionDeclaration";
  if (isFunctionDeclarationNode) {
    return getFunctionNodeName(node);
  }

  return getParentFunctionName(node);
}
