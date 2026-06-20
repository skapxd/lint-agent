import type { TSESTree } from "@typescript-eslint/utils";

export function getConstructorDefinition(
  classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
) {
  for (const member of classNode.body.body) {
    const isConstructorMethod = member.type === "MethodDefinition" &&
      member.kind === "constructor";
    if (isConstructorMethod) {
      return member;
    }
  }

  return null;
}
