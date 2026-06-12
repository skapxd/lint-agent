import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import type { FunctionNode } from "#/utils/ast/is-function-node";
import { getFunctionReturnType } from "#/utils/type-aware/get-function-return-type";
import { isSkapxdResultOrPromiseResultType } from "./is-skapxd-result-or-promise-result-type";

export function functionReturnsSkapxdResultType(node: FunctionNode, typeContext: TypeContext) {
  const returnType = getFunctionReturnType(node, typeContext);

  return Boolean(returnType && isSkapxdResultOrPromiseResultType(returnType, typeContext));
}
