import type { RuleNode, TypeContext } from "#/utils/rule-types";
import { functionReturnsSkapxdResultType } from "./function-returns-skapxd-result-type";
import { getContainingFunction } from "./get-containing-function";

export function isInsideSkapxdResultReturningFunction(node: RuleNode, typeContext: TypeContext) {
  const containingFunction = getContainingFunction(node);

  return Boolean(
    containingFunction &&
      functionReturnsSkapxdResultType(containingFunction, typeContext),
  );
}
