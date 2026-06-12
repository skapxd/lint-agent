import type { LegacyAstNode } from "#/utils/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";

export function getVariableDeclaratorName(variableDeclarator: LegacyAstNode) {
  return variableDeclarator.id.type === "Identifier"
    ? variableDeclarator.id.name
    : getFunctionNodeName(variableDeclarator.init);
}
