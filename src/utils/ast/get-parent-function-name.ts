import { getFunctionNodeName } from "./get-function-node-name";
import { getPropertyName } from "./get-property-name";
import { getVariableDeclaratorName } from "./get-variable-declarator-name";
import type { FunctionNode } from "./is-function-node";

export function getParentFunctionName(node: FunctionNode) {
  const parent = node.parent;

  const isVariableDeclaratorNode = parent.type === "VariableDeclarator";
  if (isVariableDeclaratorNode) {
    return getVariableDeclaratorName(parent);
  }

  const hasNamedFunctionParent = parent.type === "Property" ||
    parent.type === "MethodDefinition" ||
    parent.type === "PropertyDefinition";
  if (
    hasNamedFunctionParent
  ) {
    return getPropertyName(parent.key);
  }

  return getFunctionNodeName(node);
}
