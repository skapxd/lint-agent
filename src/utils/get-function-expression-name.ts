import type { RuleNode } from "#/utils/rule-types";
import { getParentFunctionName } from "./get-parent-function-name";

export function getFunctionExpressionName(node: RuleNode) {
  return node.id?.name ?? getParentFunctionName(node);
}
