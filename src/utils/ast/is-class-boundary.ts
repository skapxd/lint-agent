import type { TSESTree } from "@typescript-eslint/utils";

export function isClassBoundary(
  node: TSESTree.Node,
): node is TSESTree.ClassDeclaration | TSESTree.ClassExpression {
  return node.type === "ClassDeclaration" || node.type === "ClassExpression";
}
