import type { RuleNode, RuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { getCallExpressionExample } from "./get-call-expression-example";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getAwaitedOperationExample(
  node: RuleNode,
  sourceCode: RuleSourceCode,
) {
  const unwrappedNode = unwrapExpression(node);

  if (unwrappedNode.type === "CallExpression") {
    return getCallExpressionExample(unwrappedNode, sourceCode);
  }

  const expressionText = sourceCode.getText(unwrappedNode).replace(/\s+/g, " ");

  return expressionText.length > 80
    ? `${expressionText.slice(0, 77)}...`
    : expressionText;
}
