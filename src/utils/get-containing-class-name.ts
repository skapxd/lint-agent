import type { RuleNode } from "#/utils/rule-types";
export function getContainingClassName(node: RuleNode) {
  let current = node.parent;

  while (current) {
    if (
      current.type === "ClassDeclaration" ||
      current.type === "ClassExpression"
    ) {
      return current.id?.name ?? null;
    }

    current = current.parent;
  }

  return null;
}
