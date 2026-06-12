import type { TSESTree } from "@typescript-eslint/utils";
export function isMemberPropertyNamed(node: TSESTree.MemberExpression, propertyName: string) {
  if (node.computed) {
    return node.property.type === "Literal" && node.property.value === propertyName;
  }

  return node.property.type === "Identifier" && node.property.name === propertyName;
}
