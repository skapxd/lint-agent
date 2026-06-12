import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";
import { getVariableDeclaratorName } from "./get-variable-declarator-name";
import { isFunctionNode } from "./is-function-node";

export function getRootFunctionEntries(statement: RuleNode) {
  const declaration =
    statement.type === "ExportNamedDeclaration" ||
    statement.type === "ExportDefaultDeclaration"
      ? statement.declaration
      : statement;

  if (!declaration) {
    return [];
  }

  const isFunctionBoundary = isFunctionNode(declaration);
  if (isFunctionBoundary) {
    return [
      {
        name: getFunctionNodeName(declaration),
        node: declaration,
      },
    ];
  }

  const isVariableDeclarationNode = declaration.type === "VariableDeclaration";
  if (!isVariableDeclarationNode) {
    return [];
  }

  return declaration.declarations
    .filter((variableDeclarator: RuleNode) => isFunctionNode(variableDeclarator.init))
    .map((variableDeclarator: RuleNode) => ({
      name: getVariableDeclaratorName(variableDeclarator),
      node: variableDeclarator.init,
    }));
}
