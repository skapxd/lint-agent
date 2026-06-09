// @ts-nocheck
export function getParentFunctionReportNode(node) {
  const parent = node.parent;

  if (parent?.type === "VariableDeclarator" && parent.id.type === "Identifier") {
    return parent.id;
  }

  if (
    parent?.type === "Property" ||
    parent?.type === "MethodDefinition" ||
    parent?.type === "PropertyDefinition"
  ) {
    return parent.key;
  }

  return node.id ?? node;
}
