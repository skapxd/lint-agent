import type { TSESTree } from "@typescript-eslint/utils";
import { getCallbackReturnCall } from "./get-callback-return-call";
import { getCallFromExpression } from "./get-call-from-expression";
import { getVariableInitializer } from "#/utils/ast/get-variable-initializer";
import { isCallbackFunctionNode } from "./is-callback-function-node";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";
import { isTrySafeCall } from "./is-try-safe-call";
import type {
  RuleScope,
  RuleSourceCode,
  TypeContext,
} from "#/utils/rule-authoring/rule-types";

export function getTrySafeSourceCall(
  resultExpression: TSESTree.Node,
  sourceCode: RuleSourceCode,
  typeContext: TypeContext,
) {
  const lacksResultIdentifier = resultExpression.type !== "Identifier";
  if (lacksResultIdentifier) {
    return null;
  }

  const scope: RuleScope | undefined = sourceCode.getScope?.(resultExpression);
  if (!scope) {
    return null;
  }

  const initializer = getVariableInitializer(resultExpression, scope);
  const trySafeCall = getCallFromExpression(initializer);
  const lacksTrySafeCall = !isTrySafeCall(trySafeCall, ["trySafe"]);
  if (lacksTrySafeCall) {
    return null;
  }

  const trySafeSymbol = typeContext.services.getSymbolAtLocation(trySafeCall.callee);
  const isSkapxdTrySafe = Boolean(
    trySafeSymbol && isSymbolFromSkapxdResult(trySafeSymbol, typeContext),
  );
  if (!isSkapxdTrySafe) {
    return null;
  }

  const callback = trySafeCall.arguments[0];
  const lacksCallback = !isCallbackFunctionNode(callback);
  if (lacksCallback) {
    return null;
  }

  return getCallbackReturnCall(callback);
}
