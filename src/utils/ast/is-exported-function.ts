import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function isExportedFunction(node: RuleNode) {
  const parent = node.parent;

  const isExportedFunctionDeclaration = node.type === "FunctionDeclaration" &&
    (parent?.type === "ExportNamedDeclaration" ||
      parent?.type === "ExportDefaultDeclaration");
  if (
    isExportedFunctionDeclaration
  ) {
    return true;
  }

  const isExportedFunctionValue = (node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionExpression") &&
    parent?.type === "VariableDeclarator" &&
    parent.parent?.parent?.type === "ExportNamedDeclaration";
  if (
    isExportedFunctionValue
  ) {
    return true;
  }

  return false;
}
