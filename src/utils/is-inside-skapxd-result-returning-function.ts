import type { LegacyAstNode } from "#/utils/rule-types";
import { functionReturnsSkapxdResultType } from "./function-returns-skapxd-result-type";
import { getContainingFunction } from "./get-containing-function";

export function isInsideSkapxdResultReturningFunction(node: LegacyAstNode, typeContext: LegacyAstNode) {
  const containingFunction = getContainingFunction(node);

  return Boolean(
    containingFunction &&
      functionReturnsSkapxdResultType(containingFunction, typeContext),
  );
}
