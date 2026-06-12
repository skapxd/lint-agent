import type { TSESTree } from "@typescript-eslint/utils";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isResultErrCall } from "./is-result-err-call";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";

export function isSkapxdResultErrCall(node: TSESTree.CallExpression, typeContext: TypeContext) {
  const isResultErrFactoryCall = isResultErrCall(node);
  if (!isResultErrFactoryCall) {
    return false;
  }

  const symbol = typeContext.services.getSymbolAtLocation(node.callee.object);

  return Boolean(symbol && isSymbolFromSkapxdResult(symbol, typeContext));
}
