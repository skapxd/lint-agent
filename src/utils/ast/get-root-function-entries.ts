import type { TSESTree } from "@typescript-eslint/utils";
import { getFunctionNodeName } from "./get-function-node-name";
import { getVariableDeclaratorName } from "./get-variable-declarator-name";
import { isFunctionNode, type FunctionNode } from "./is-function-node";

type RootFunctionEntry = {
  name: string;
  node: FunctionNode;
};

export function getRootFunctionEntries(statement: TSESTree.Node): RootFunctionEntry[] {
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

  const entries: RootFunctionEntry[] = [];

  for (const variableDeclarator of declaration.declarations) {
    if (!isFunctionNode(variableDeclarator.init)) {
      continue;
    }

    entries.push({
      name: getVariableDeclaratorName(variableDeclarator),
      node: variableDeclarator.init,
    });
  }

  return entries;
}
