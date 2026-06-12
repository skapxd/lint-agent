import type { TSESTree } from "@typescript-eslint/utils";
import type { RuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { getCallExpressionExample } from "./get-call-expression-example";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getAwaitedOperationExample(
  node: TSESTree.Node,
  sourceCode: RuleSourceCode,
) {
  const unwrappedNode = unwrapExpression(node);

  const isCallExpressionNode = unwrappedNode.type === "CallExpression";
  if (isCallExpressionNode) {
    return getCallExpressionExample(unwrappedNode, sourceCode);
  }

  const expressionText = sourceCode.getText(unwrappedNode).replace(/\s+/g, " ");

  return expressionText.length > 80
    ? `${expressionText.slice(0, 77)}...`
    : expressionText;
}
