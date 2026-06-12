import type { TSESTree } from "@typescript-eslint/utils";
// Un método que expande la superficie pública de la clase: descarta
// constructor, getters/setters, private/protected, #privados y el prefijo
// `_` (la convención de privado suave).
export function isPublicClassMethod(
  member: TSESTree.ClassElement,
): member is TSESTree.MethodDefinition & { key: TSESTree.Identifier } {
  const isMethodDefinitionNode = member.type === "MethodDefinition";
  if (!isMethodDefinitionNode) {
    return false;
  }

  const includesConstructorGetSet = ["constructor", "get", "set"].includes(String(member.kind));
  if (includesConstructorGetSet) {
    return false;
  }

  const includesPrivateProtected = ["private", "protected"].includes(member.accessibility ?? "");
  if (includesPrivateProtected) {
    return false;
  }

  const key = member.key;
  const hasIdentifierKey = key.type === "Identifier";
  if (!hasIdentifierKey) {
    return false;
  }

  return !key.name.startsWith("_");
}
