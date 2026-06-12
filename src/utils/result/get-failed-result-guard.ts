import type { TSESTree } from "@typescript-eslint/utils";
import { getErrorMemberObject } from "./get-error-member-object";
import { getFailedResultBinaryGuardName } from "./get-failed-result-binary-guard-name";
import { getOkMemberObject } from "./get-ok-member-object";
import { getResultCheckArgument } from "./get-result-check-argument";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getFailedResultGuard(node: TSESTree.Node) {
  const unwrappedNode = unwrapExpression(node);

  // `result.error` como condición (truthiness del error)
  const isMemberExpressionNode = unwrappedNode.type === "MemberExpression";
  if (isMemberExpressionNode) {
    return getErrorMemberObject(unwrappedNode);
  }

  // `!result.ok` o `!Result.isOk(result)`
  const isNegatedResultGuard = unwrappedNode.type === "UnaryExpression" && unwrappedNode.operator === "!";
  if (isNegatedResultGuard) {
    return (
      getOkMemberObject(unwrappedNode.argument) ??
      getResultCheckArgument(unwrappedNode.argument, "isOk")
    );
  }

  // `Result.isErr(result)`
  const isCallExpressionNode = unwrappedNode.type === "CallExpression";
  if (isCallExpressionNode) {
    return getResultCheckArgument(unwrappedNode, "isErr");
  }

  // `result.ok === false` / `result.ok !== true`
  const isBinaryResultGuard = unwrappedNode.type === "BinaryExpression" &&
    ["===", "!=="].includes(unwrappedNode.operator);
  if (
    isBinaryResultGuard
  ) {
    return getFailedResultBinaryGuardName(unwrappedNode);
  }

  return null;
}
