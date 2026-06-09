// @ts-nocheck
import { getFunctionNodeName } from "./get-function-node-name";

export function getVariableDeclaratorName(variableDeclarator) {
  return variableDeclarator.id.type === "Identifier"
    ? variableDeclarator.id.name
    : getFunctionNodeName(variableDeclarator.init);
}
