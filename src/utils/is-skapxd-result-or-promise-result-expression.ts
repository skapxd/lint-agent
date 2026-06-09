// @ts-nocheck
import { isSkapxdResultOrPromiseResultType } from "./is-skapxd-result-or-promise-result-type";

export function isSkapxdResultOrPromiseResultExpression(node, typeContext) {
  return isSkapxdResultOrPromiseResultType(
    typeContext.services.getTypeAtLocation(node),
    typeContext,
  );
}
