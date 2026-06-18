import type { TSESTree } from "@typescript-eslint/utils";
import { hasDecorators } from "./has-decorators";
import { isBootstrapCall } from "./is-bootstrap-call";
import { isNamedLifecycleNode } from "./is-named-lifecycle-node";
import type { NoRethrowResultErrorOptions } from "#/utils/options/get-no-rethrow-result-error-options";

export function isInsideLifecycleOrTransversalBoundary(
  node: TSESTree.Node,
  options: NoRethrowResultErrorOptions,
) {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    const isLifecycleNode = isNamedLifecycleNode(
      current,
      options.lifecycleFunctionNames,
    );
    const isBootstrapBoundary = isBootstrapCall(current, options.bootstrapCallNames);
    const isDecoratedMethod = current.type === "MethodDefinition" &&
      hasDecorators(current);
    const isExemptBoundary = isLifecycleNode ||
      isBootstrapBoundary ||
      isDecoratedMethod;
    if (isExemptBoundary) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
