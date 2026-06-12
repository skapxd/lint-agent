import type { RuleNode, TypeContext } from "#/utils/rule-authoring/rule-types";
import { isResultErrCall } from "./is-result-err-call";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";

export function isSkapxdResultErrCall(node: RuleNode, typeContext: TypeContext) {
  if (!isResultErrCall(node)) {
    return false;
  }

  const symbol = typeContext.services.getSymbolAtLocation(node.callee.object);

  return Boolean(symbol && isSymbolFromSkapxdResult(symbol, typeContext));
}
