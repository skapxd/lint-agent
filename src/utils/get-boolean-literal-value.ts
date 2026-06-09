// @ts-nocheck
import { unwrapExpression } from "./unwrap-expression";

export function getBooleanLiteralValue(node) {
  const unwrappedNode = unwrapExpression(node);

  return unwrappedNode.type === "Literal" && typeof unwrappedNode.value === "boolean"
    ? unwrappedNode.value
    : null;
}
