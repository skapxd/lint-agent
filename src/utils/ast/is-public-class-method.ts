import type { RuleNode } from "#/utils/rule-authoring/rule-types";
// Un método que expande la superficie pública de la clase: descarta
// constructor, getters/setters, private/protected, #privados y el prefijo
// `_` (la convención de privado suave).
export function isPublicClassMethod(member: RuleNode) {
  const isMethodDefinitionNode = member.type === "MethodDefinition";
  if (!isMethodDefinitionNode) {
    return false;
  }

  const includesConstructorGetSet = ["constructor", "get", "set"].includes(String(member.kind));
  if (includesConstructorGetSet) {
    return false;
  }

  const includesPrivateProtected = ["private", "protected"].includes(member.accessibility);
  if (includesPrivateProtected) {
    return false;
  }

  const hasIdentifierKey = member.key?.type === "Identifier";
  if (!hasIdentifierKey) {
    return false;
  }

  return !member.key.name.startsWith("_");
}
