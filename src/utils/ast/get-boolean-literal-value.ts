import type { TSESTree } from "@typescript-eslint/utils";
import { unwrapExpression } from "./unwrap-expression";

export function getBooleanLiteralValue(node: TSESTree.Node) {
  const unwrappedNode = unwrapExpression(node);

  return unwrappedNode.type === "Literal" && typeof unwrappedNode.value === "boolean"
    ? unwrappedNode.value
    : null;
}
