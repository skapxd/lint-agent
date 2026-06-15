import type { TSESTree } from "@typescript-eslint/utils";
import type { RuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { getCallExpressionExample } from "./get-call-expression-example";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

const MAX_AWAITED_OPERATION_EXAMPLE_LENGTH = 80;
const TRUNCATED_AWAITED_OPERATION_PREFIX_LENGTH = 77;

export function getAwaitedOperationExample(
  node: TSESTree.Node,
  sourceCode: RuleSourceCode,
) {
  const unwrappedNode = unwrapExpression(node);

  const isCallExpressionNode = unwrappedNode.type === "CallExpression";
  if (isCallExpressionNode) {
    return getCallExpressionExample(unwrappedNode, sourceCode);
  }

  const expressionText =
    sourceCode.getText?.(unwrappedNode).replace(/\s+/g, " ") ?? "operacion";

  return expressionText.length > MAX_AWAITED_OPERATION_EXAMPLE_LENGTH
    ? `${expressionText.slice(0, TRUNCATED_AWAITED_OPERATION_PREFIX_LENGTH)}...`
    : expressionText;
}
