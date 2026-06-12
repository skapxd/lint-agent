import type { LegacyAstNode } from "#/utils/rule-types";
import { unwrapExpression } from "./unwrap-expression";

export function getBooleanLiteralValue(node: LegacyAstNode) {
  const unwrappedNode = unwrapExpression(node);

  return unwrappedNode.type === "Literal" && typeof unwrappedNode.value === "boolean"
    ? unwrappedNode.value
    : null;
}
