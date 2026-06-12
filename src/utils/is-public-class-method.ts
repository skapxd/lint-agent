import type { LegacyAstNode } from "#/utils/rule-types";
// Un método que expande la superficie pública de la clase: descarta
// constructor, getters/setters, private/protected, #privados y el prefijo
// `_` (la convención de privado suave).
export function isPublicClassMethod(member: LegacyAstNode) {
  if (member.type !== "MethodDefinition") {
    return false;
  }

  if (["constructor", "get", "set"].includes(member.kind)) {
    return false;
  }

  if (["private", "protected"].includes(member.accessibility)) {
    return false;
  }

  if (member.key?.type !== "Identifier") {
    return false;
  }

  return !member.key.name.startsWith("_");
}
