import type { RuleNode } from "#/utils/rule-types";
import { getErrorMemberObject } from "./get-error-member-object";
import { getFailedResultBinaryGuardName } from "./get-failed-result-binary-guard-name";
import { getOkMemberObject } from "./get-ok-member-object";
import { getResultCheckArgument } from "./get-result-check-argument";
import { unwrapExpression } from "./unwrap-expression";

export function getFailedResultGuard(node: RuleNode) {
  const unwrappedNode = unwrapExpression(node);

  // `result.error` como condición (truthiness del error)
  if (unwrappedNode.type === "MemberExpression") {
    return getErrorMemberObject(unwrappedNode);
  }

  // `!result.ok` o `!Result.isOk(result)`
  if (unwrappedNode.type === "UnaryExpression" && unwrappedNode.operator === "!") {
    return (
      getOkMemberObject(unwrappedNode.argument) ??
      getResultCheckArgument(unwrappedNode.argument, "isOk")
    );
  }

  // `Result.isErr(result)`
  if (unwrappedNode.type === "CallExpression") {
    return getResultCheckArgument(unwrappedNode, "isErr");
  }

  // `result.ok === false` / `result.ok !== true`
  if (
    unwrappedNode.type === "BinaryExpression" &&
    ["===", "!=="].includes(unwrappedNode.operator)
  ) {
    return getFailedResultBinaryGuardName(unwrappedNode);
  }

  return null;
}
