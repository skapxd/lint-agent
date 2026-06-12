import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getContainingClassName(node: RuleNode) {
  let current = node.parent;

  while (current) {
    const isClassBoundary = current.type === "ClassDeclaration" ||
      current.type === "ClassExpression";
    if (
      isClassBoundary
    ) {
      return current.id?.name ?? null;
    }

    current = current.parent;
  }

  return null;
}
