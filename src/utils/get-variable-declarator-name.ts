import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";

export function getVariableDeclaratorName(variableDeclarator: RuleNode) {
  return variableDeclarator.id.type === "Identifier"
    ? variableDeclarator.id.name
    : getFunctionNodeName(variableDeclarator.init);
}
