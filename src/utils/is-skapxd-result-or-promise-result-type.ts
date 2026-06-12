import type { LegacyAstNode } from "#/utils/rule-types";
import { isSkapxdResultType } from "./is-skapxd-result-type";

export function isSkapxdResultOrPromiseResultType(type: LegacyAstNode, typeContext: LegacyAstNode) {
  if (isSkapxdResultType(type, typeContext)) {
    return true;
  }

  const promisedType = typeContext.checker.getPromisedTypeOfPromise(type);

  return Boolean(promisedType && isSkapxdResultType(promisedType, typeContext));
}
