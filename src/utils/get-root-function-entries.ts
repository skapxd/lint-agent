import type { LegacyAstNode } from "#/utils/rule-types";
import { getFunctionNodeName } from "./get-function-node-name";
import { getVariableDeclaratorName } from "./get-variable-declarator-name";
import { isFunctionNode } from "./is-function-node";

export function getRootFunctionEntries(statement: LegacyAstNode) {
  const declaration =
    statement.type === "ExportNamedDeclaration" ||
    statement.type === "ExportDefaultDeclaration"
      ? statement.declaration
      : statement;

  if (!declaration) {
    return [];
  }

  if (isFunctionNode(declaration)) {
    return [
      {
        name: getFunctionNodeName(declaration),
        node: declaration,
      },
    ];
  }

  if (declaration.type !== "VariableDeclaration") {
    return [];
  }

  return declaration.declarations
    .filter((variableDeclarator: LegacyAstNode) => isFunctionNode(variableDeclarator.init))
    .map((variableDeclarator: LegacyAstNode) => ({
      name: getVariableDeclaratorName(variableDeclarator),
      node: variableDeclarator.init,
    }));
}
