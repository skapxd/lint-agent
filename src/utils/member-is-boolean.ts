import type { LegacyAstNode } from "#/utils/rule-types";
// ¿El miembro es boolean? Por anotación (isSyncing: boolean) o por
// inicializador literal (isProcessing = false).
export function memberIsBoolean(member: LegacyAstNode) {
  if (member.typeAnnotation?.typeAnnotation?.type === "TSBooleanKeyword") {
    return true;
  }

  return (
    member.type === "PropertyDefinition" &&
    member.value?.type === "Literal" &&
    typeof member.value.value === "boolean"
  );
}
