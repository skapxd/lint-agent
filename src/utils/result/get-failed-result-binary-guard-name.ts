import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getBooleanLiteralValue } from "#/utils/ast/get-boolean-literal-value";
import { getOkMemberObject } from "./get-ok-member-object";
import { isFailedOkComparison } from "./is-failed-ok-comparison";

export function getFailedResultBinaryGuardName(node: RuleNode) {
  const leftResult = getOkMemberObject(node.left);
  const rightResult = getOkMemberObject(node.right);
  const leftBoolean = getBooleanLiteralValue(node.left);
  const rightBoolean = getBooleanLiteralValue(node.right);

  const leftResultChecksBoolean = leftResult && rightBoolean !== null;
  if (leftResultChecksBoolean) {
    return isFailedOkComparison(node.operator, rightBoolean) ? leftResult : null;
  }

  const rightResultChecksBoolean = rightResult && leftBoolean !== null;
  if (rightResultChecksBoolean) {
    return isFailedOkComparison(node.operator, leftBoolean) ? rightResult : null;
  }

  return null;
}
