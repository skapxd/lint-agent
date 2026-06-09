// @ts-nocheck
import { getContainingFunction } from "./get-containing-function";
import { getFunctionName } from "./get-function-name";

export function getAwaitScopeName(node) {
  const containingFunction = getContainingFunction(node);

  return containingFunction ? getFunctionName(containingFunction) : "top-level";
}
