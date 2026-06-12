import type { RuleNode } from "#/utils/rule-authoring/rule-types";
export function isFunctionNode(node: RuleNode) {
  return (
    node?.type === "FunctionDeclaration" ||
    node?.type === "FunctionExpression" ||
    node?.type === "ArrowFunctionExpression"
  );
}
