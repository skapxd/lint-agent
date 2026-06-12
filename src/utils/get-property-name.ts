import type { LegacyAstNode } from "#/utils/rule-types";
export function getPropertyName(node: LegacyAstNode) {
  if (!node) {
    return "anonymous";
  }

  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "Literal") {
    return String(node.value);
  }

  return "anonymous";
}
