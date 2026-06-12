import type { LegacyAstNode } from "#/utils/rule-types";
import { getFunctionReturnType } from "./get-function-return-type";
import { isSkapxdResultOrPromiseResultType } from "./is-skapxd-result-or-promise-result-type";

export function functionReturnsSkapxdResultType(node: LegacyAstNode, typeContext: LegacyAstNode) {
  const returnType = getFunctionReturnType(node, typeContext);

  return Boolean(returnType && isSkapxdResultOrPromiseResultType(returnType, typeContext));
}
