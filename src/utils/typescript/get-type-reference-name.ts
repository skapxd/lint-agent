import type { TSESTree } from "@typescript-eslint/utils";

type TypeReferenceName = TSESTree.TSTypeReference["typeName"];

export function getTypeReferenceName(typeName: TypeReferenceName): string | null {
  const isIdentifierTypeName = typeName.type === "Identifier";
  if (isIdentifierTypeName) {
    return typeName.name;
  }

  const isQualifiedTypeName = typeName.type === "TSQualifiedName";
  if (!isQualifiedTypeName) {
    return null;
  }

  return getTypeReferenceName(typeName.right);
}
