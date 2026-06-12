import type { RuleNode } from "#/utils/rule-types";
import { getBooleanLiteralValue } from "./get-boolean-literal-value";
import { getOkMemberObject } from "./get-ok-member-object";
import { isFailedOkComparison } from "./is-failed-ok-comparison";

export function getFailedResultBinaryGuardName(node: RuleNode) {
  const leftResult = getOkMemberObject(node.left);
  const rightResult = getOkMemberObject(node.right);
  const leftBoolean = getBooleanLiteralValue(node.left);
  const rightBoolean = getBooleanLiteralValue(node.right);

  if (leftResult && rightBoolean !== null) {
    return isFailedOkComparison(node.operator, rightBoolean) ? leftResult : null;
  }

  if (rightResult && leftBoolean !== null) {
    return isFailedOkComparison(node.operator, leftBoolean) ? rightResult : null;
  }

  return null;
}
