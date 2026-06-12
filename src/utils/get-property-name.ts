import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function getPropertyName(node: RuleNode) {
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
