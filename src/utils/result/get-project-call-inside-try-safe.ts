import type { TSESTree } from "@typescript-eslint/utils";
import { callbackContainsExternalCall } from "./callback-contains-external-call";
import { getCallbackReturnCall } from "./get-callback-return-call";
import { getCallOrigin } from "./get-call-origin";
import { isCallbackFunctionNode } from "./is-callback-function-node";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";
import { isTrySafeCall } from "./is-try-safe-call";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function getProjectCallInsideTrySafe(
  node: TSESTree.CallExpression,
  typeContext: TypeContext,
) {
  const lacksTrySafeShape = !isTrySafeCall(node, ["trySafe"]);
  if (lacksTrySafeShape) {
    return null;
  }

  const trySafeSymbol = typeContext.services.getSymbolAtLocation(node.callee);
  const isSkapxdTrySafe = Boolean(
    trySafeSymbol && isSymbolFromSkapxdResult(trySafeSymbol, typeContext),
  );
  if (!isSkapxdTrySafe) {
    return null;
  }

  const callback = node.arguments[0];
  const lacksCallback = !isCallbackFunctionNode(callback);
  if (lacksCallback) {
    return null;
  }

  const sourceCall = getCallbackReturnCall(callback);
  if (!sourceCall) {
    return null;
  }

  const callbackTouchesExternalOrigin = callbackContainsExternalCall(callback, typeContext);
  if (callbackTouchesExternalOrigin) {
    return null;
  }

  const sourceOrigin = getCallOrigin(sourceCall, typeContext);

  return sourceOrigin === "project" ? sourceCall : null;
}
