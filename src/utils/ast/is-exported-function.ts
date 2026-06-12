import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function isExportedFunction(node: RuleNode) {
  const parent = node.parent;

  if (
    node.type === "FunctionDeclaration" &&
    (parent?.type === "ExportNamedDeclaration" ||
      parent?.type === "ExportDefaultDeclaration")
  ) {
    return true;
  }

  if (
    (node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionExpression") &&
    parent?.type === "VariableDeclarator" &&
    parent.parent?.parent?.type === "ExportNamedDeclaration"
  ) {
    return true;
  }

  return false;
}
