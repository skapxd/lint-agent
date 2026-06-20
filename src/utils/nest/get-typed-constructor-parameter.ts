import type { TSESTree } from "@typescript-eslint/utils";

export function getTypedConstructorParameter(parameter: TSESTree.Parameter) {
  const innerParameter = parameter.type === "TSParameterProperty"
    ? parameter.parameter
    : parameter;

  const isIdentifierParameter = innerParameter.type === "Identifier";
  if (isIdentifierParameter) {
    return innerParameter;
  }

  const isAssignmentParameter = innerParameter.type === "AssignmentPattern";
  if (isAssignmentParameter) {
    const assignmentTarget = innerParameter.left;
    const hasIdentifierTarget = assignmentTarget.type === "Identifier";
    return hasIdentifierTarget ? assignmentTarget : null;
  }

  return null;
}
