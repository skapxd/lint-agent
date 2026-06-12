import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { unwrapExpression } from "./unwrap-expression";

export function getBooleanLiteralValue(node: RuleNode) {
  const unwrappedNode = unwrapExpression(node);

  return unwrappedNode.type === "Literal" && typeof unwrappedNode.value === "boolean"
    ? unwrappedNode.value
    : null;
}
