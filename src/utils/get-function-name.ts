import type { RuleNode } from "#/utils/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";
import { getParentFunctionName } from "./get-parent-function-name";

export function getFunctionName(node: RuleNode) {
  if (node.type === "FunctionDeclaration") {
    return getFunctionNodeName(node);
  }

  return getParentFunctionName(node);
}
