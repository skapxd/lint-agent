import type { TSESTree } from "@typescript-eslint/utils";
import { isAstNode } from "./is-ast-node";
// ¿El miembro es boolean? Por anotación (isSyncing: boolean) o por
// inicializador literal (isProcessing = false).
export function memberIsBoolean(member: TSESTree.PropertyDefinition | TSESTree.TSPropertySignature) {
  const typeAnnotation = member.typeAnnotation;
  const isTSBooleanKeywordNode = typeAnnotation !== undefined &&
    typeAnnotation.typeAnnotation.type === "TSBooleanKeyword";
  if (isTSBooleanKeywordNode) {
    return true;
  }

  return (
    member.type === "PropertyDefinition" &&
    isAstNode(member.value) &&
    member.value.type === "Literal" &&
    typeof member.value.value === "boolean"
  );
}
