// @ts-nocheck
import { getCallExpressionExample } from "./get-call-expression-example";
import { unwrapExpression } from "./unwrap-expression";

export function getAwaitedOperationExample(node, sourceCode) {
  const unwrappedNode = unwrapExpression(node);

  if (unwrappedNode.type === "CallExpression") {
    return getCallExpressionExample(unwrappedNode, sourceCode);
  }

  const expressionText = sourceCode.getText(unwrappedNode).replace(/\s+/g, " ");

  return expressionText.length > 80
    ? `${expressionText.slice(0, 77)}...`
    : expressionText;
}
