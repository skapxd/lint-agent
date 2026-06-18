import type { TSESTree } from "@typescript-eslint/utils";

export function getIdentifierFromPattern(
  node: TSESTree.Node,
): TSESTree.Identifier | null {
  const identifier = node.type === "Identifier" ? node : null;
  if (identifier) {
    return identifier;
  }

  const assignmentPattern = node.type === "AssignmentPattern" ? node : null;
  if (!assignmentPattern) {
    return null;
  }

  return assignmentPattern.left.type === "Identifier"
    ? assignmentPattern.left
    : null;
}
