// @ts-nocheck
export function isExportedFunction(node) {
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
