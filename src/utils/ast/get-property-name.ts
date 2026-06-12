import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getPropertyName(node: RuleNode) {
  if (!node) {
    return "anonymous";
  }

  const isIdentifierNode = node.type === "Identifier";
  if (isIdentifierNode) {
    return node.name;
  }

  const isLiteralNode = node.type === "Literal";
  if (isLiteralNode) {
    return String(node.value);
  }

  return "anonymous";
}
