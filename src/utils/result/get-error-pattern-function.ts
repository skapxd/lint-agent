import type { TSESTree } from "@typescript-eslint/utils";
import { getResultErrorBinding } from "./get-result-error-binding";
import { isCallbackFunctionNode } from "./is-callback-function-node";
import { isSameSymbol } from "./is-same-symbol";
import type { CallbackFunctionNode } from "./no-rethrow-result-error-types";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function getErrorPatternFunction(
  node: TSESTree.Identifier,
  typeContext: TypeContext,
): CallbackFunctionNode | null {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    const callback = isCallbackFunctionNode(current) ? current : null;
    if (!callback) {
      current = current.parent;
      continue;
    }

    const firstParameter = callback.params[0];
    const hasObjectPatternParameter = firstParameter?.type === "ObjectPattern";
    const errorBinding = hasObjectPatternParameter
      ? getResultErrorBinding(firstParameter)
      : null;
    if (!errorBinding) {
      current = current.parent;
      continue;
    }

    const matchesThrownError = isSameSymbol(node, errorBinding, typeContext);

    return matchesThrownError ? callback : null;
  }

  return null;
}
