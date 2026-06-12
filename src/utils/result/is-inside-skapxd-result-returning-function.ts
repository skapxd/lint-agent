import type { TSESTree } from "@typescript-eslint/utils";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { functionReturnsSkapxdResultType } from "./function-returns-skapxd-result-type";
import { getContainingFunction } from "#/utils/ast/get-containing-function";

export function isInsideSkapxdResultReturningFunction(node: TSESTree.Node, typeContext: TypeContext) {
  const containingFunction = getContainingFunction(node);

  return Boolean(
    containingFunction &&
      functionReturnsSkapxdResultType(containingFunction, typeContext),
  );
}
