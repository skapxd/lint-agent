import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "./is-ast-node";
// ¿El miembro es boolean? Por anotación (isSyncing: boolean) o por
// inicializador literal (isProcessing = false).
export function memberIsBoolean(member: RuleNode) {
  const isTSBooleanKeywordNode = member.typeAnnotation?.typeAnnotation?.type === "TSBooleanKeyword";
  if (isTSBooleanKeywordNode) {
    return true;
  }

  return (
    member.type === "PropertyDefinition" &&
    isAstNode(member.value) &&
    member.value?.type === "Literal" &&
    typeof member.value.value === "boolean"
  );
}
