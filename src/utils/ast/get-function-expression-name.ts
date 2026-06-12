import type { TSESTree } from "@typescript-eslint/utils";
import { getParentFunctionName } from "./get-parent-function-name";

export function getFunctionExpressionName(node: TSESTree.FunctionExpression) {
  return node.id?.name ?? getParentFunctionName(node);
}
