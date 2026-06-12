import type { TSESTree } from "@typescript-eslint/utils";
import { getContainingFunction } from "./get-containing-function";
import { getFunctionName } from "./get-function-name";

export function getAwaitScopeName(node: TSESTree.Node) {
  const containingFunction = getContainingFunction(node);

  return containingFunction ? getFunctionName(containingFunction) : "top-level";
}
