import type { LegacyAstNode } from "#/utils/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";
import { getParentFunctionName } from "./get-parent-function-name";

export function getFunctionName(node: LegacyAstNode) {
  if (node.type === "FunctionDeclaration") {
    return getFunctionNodeName(node);
  }

  return getParentFunctionName(node);
}
