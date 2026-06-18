import type { TSESTree } from "@typescript-eslint/utils";
import type { CallbackFunctionNode } from "./no-rethrow-result-error-types";

export function isCallbackFunctionNode(
  node: TSESTree.Node | null | undefined,
): node is CallbackFunctionNode {
  const isArrowFunction = node?.type === "ArrowFunctionExpression";
  const isFunctionExpression = node?.type === "FunctionExpression";

  return isArrowFunction || isFunctionExpression;
}
