import type { TSESTree } from "@typescript-eslint/utils";
import { getFunctionNodeName } from "./get-function-node-name";
import { isFunctionNode } from "./is-function-node";

export function getVariableDeclaratorName(variableDeclarator: TSESTree.VariableDeclarator) {
  const variableName = variableDeclarator.id;
  const hasIdentifierName = variableName.type === "Identifier";
  if (hasIdentifierName) {
    return variableName.name;
  }

  return isFunctionNode(variableDeclarator.init)
    ? getFunctionNodeName(variableDeclarator.init)
    : "helper";
}
