import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "./is-member-property-named";

export function isCalleeNamed(node: RuleNode, names: readonly string[]) {
  const isIdentifierNode = node?.type === "Identifier";
  if (isIdentifierNode) {
    return names.includes(node.name);
  }

  const isMemberExpressionNode = node?.type === "MemberExpression";
  if (isMemberExpressionNode) {
    return names.some((name: string) => isMemberPropertyNamed(node, name));
  }

  return false;
}
