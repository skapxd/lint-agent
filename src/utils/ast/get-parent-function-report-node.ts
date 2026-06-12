import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getParentFunctionReportNode(node: RuleNode) {
  const parent = node.parent;

  const hasVariableDeclaratorName = parent?.type === "VariableDeclarator" && parent.id.type === "Identifier";
  if (hasVariableDeclaratorName) {
    return parent.id;
  }

  const hasPropertyLikeParent = parent?.type === "Property" ||
    parent?.type === "MethodDefinition" ||
    parent?.type === "PropertyDefinition";
  if (
    hasPropertyLikeParent
  ) {
    return parent.key;
  }

  return node.id ?? node;
}
