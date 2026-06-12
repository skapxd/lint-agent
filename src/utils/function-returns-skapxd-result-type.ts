import type { RuleNode, TypeContext } from "#/utils/rule-authoring/rule-types";
import { getFunctionReturnType } from "./get-function-return-type";
import { isSkapxdResultOrPromiseResultType } from "./is-skapxd-result-or-promise-result-type";

export function functionReturnsSkapxdResultType(node: RuleNode, typeContext: TypeContext) {
  const returnType = getFunctionReturnType(node, typeContext);

  return Boolean(returnType && isSkapxdResultOrPromiseResultType(returnType, typeContext));
}
