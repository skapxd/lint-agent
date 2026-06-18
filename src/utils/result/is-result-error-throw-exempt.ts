import type { TSESTree } from "@typescript-eslint/utils";
import { isInsideControllerBoundary } from "./is-inside-controller-boundary";
import { isInsideLifecycleOrTransversalBoundary } from "./is-inside-lifecycle-or-transversal-boundary";
import type { NoRethrowResultErrorOptions } from "#/utils/options/get-no-rethrow-result-error-options";

export function isResultErrorThrowExempt(
  node: TSESTree.ThrowStatement,
  filename: string,
  options: NoRethrowResultErrorOptions,
) {
  const isControllerBoundary = isInsideControllerBoundary(
    node,
    filename,
    options,
  );
  const isLifecycleOrTransversalBoundary =
    isInsideLifecycleOrTransversalBoundary(node, options);

  return isControllerBoundary || isLifecycleOrTransversalBoundary;
}
