// @ts-nocheck
import { getParentFunctionName } from "./get-parent-function-name";

export function getFunctionExpressionName(node) {
  return node.id?.name ?? getParentFunctionName(node);
}
