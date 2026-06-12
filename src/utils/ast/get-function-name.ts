import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";
import { getParentFunctionName } from "./get-parent-function-name";

export function getFunctionName(node: RuleNode) {
  const isFunctionDeclarationNode = node.type === "FunctionDeclaration";
  if (isFunctionDeclarationNode) {
    return getFunctionNodeName(node);
  }

  return getParentFunctionName(node);
}
