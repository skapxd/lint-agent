import type { TSESTree } from "@typescript-eslint/utils";

export function getParameterName(param: TSESTree.Parameter): string {
  const isIdentifierParameter = param.type === "Identifier";
  if (isIdentifierParameter) {
    return param.name;
  }

  const isAssignmentParameter = param.type === "AssignmentPattern";
  if (!isAssignmentParameter) {
    return "parametro";
  }

  const assignmentLeft = param.left;
  const isIdentifierAssignmentParameter = assignmentLeft.type === "Identifier";
  if (isIdentifierAssignmentParameter) {
    return assignmentLeft.name;
  }

  return "parametro";
}
