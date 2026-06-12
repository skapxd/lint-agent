import type { LegacyAstNode } from "#/utils/rule-types";
export function isFunctionNode(node: LegacyAstNode) {
  return (
    node?.type === "FunctionDeclaration" ||
    node?.type === "FunctionExpression" ||
    node?.type === "ArrowFunctionExpression"
  );
}
