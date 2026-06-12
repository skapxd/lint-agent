import type { RuleNode } from "#/utils/rule-types";
export function isFunctionNode(node: RuleNode) {
  return (
    node?.type === "FunctionDeclaration" ||
    node?.type === "FunctionExpression" ||
    node?.type === "ArrowFunctionExpression"
  );
}
