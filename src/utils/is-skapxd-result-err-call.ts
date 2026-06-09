// @ts-nocheck
import { isResultErrCall } from "./is-result-err-call";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";

export function isSkapxdResultErrCall(node, typeContext) {
  if (!isResultErrCall(node)) {
    return false;
  }

  const symbol = typeContext.services.getSymbolAtLocation(node.callee.object);

  return Boolean(symbol && isSymbolFromSkapxdResult(symbol, typeContext));
}
