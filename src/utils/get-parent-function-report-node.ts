import type { RuleNode } from "#/utils/rule-types";
export function getParentFunctionReportNode(node: RuleNode) {
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
