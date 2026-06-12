import type { LegacyAstNode } from "#/utils/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";
import { getPropertyName } from "./get-property-name";
import { getVariableDeclaratorName } from "./get-variable-declarator-name";

export function getParentFunctionName(node: LegacyAstNode) {
  const parent = node.parent;

  if (parent?.type === "VariableDeclarator") {
    return getVariableDeclaratorName(parent);
  }

  if (
    parent?.type === "Property" ||
    parent?.type === "MethodDefinition" ||
    parent?.type === "PropertyDefinition"
  ) {
    return getPropertyName(parent.key);
  }

  return getFunctionNodeName(node);
}
