// @ts-nocheck
import { functionReturnsSkapxdResultType } from "./function-returns-skapxd-result-type";
import { getContainingFunction } from "./get-containing-function";

export function isInsideSkapxdResultReturningFunction(node, typeContext) {
  const containingFunction = getContainingFunction(node);

  return Boolean(
    containingFunction &&
      functionReturnsSkapxdResultType(containingFunction, typeContext),
  );
}
