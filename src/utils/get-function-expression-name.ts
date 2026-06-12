import type { LegacyAstNode } from "#/utils/rule-types";
import { getParentFunctionName } from "./get-parent-function-name";

export function getFunctionExpressionName(node: LegacyAstNode) {
  return node.id?.name ?? getParentFunctionName(node);
}
