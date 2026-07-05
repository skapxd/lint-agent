import type { TSESTree } from "@typescript-eslint/utils";

export function isDestructuredParameter(param: TSESTree.Parameter) {
  const isDestructuringPattern = param.type === "ObjectPattern" ||
    param.type === "ArrayPattern";
  if (isDestructuringPattern) {
    return true;
  }

  const isDestructuredAssignment = param.type === "AssignmentPattern" &&
    (param.left.type === "ObjectPattern" || param.left.type === "ArrayPattern");

  return isDestructuredAssignment;
}
