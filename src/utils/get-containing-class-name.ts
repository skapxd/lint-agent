import type { LegacyAstNode } from "#/utils/rule-types";
export function getContainingClassName(node: LegacyAstNode) {
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
