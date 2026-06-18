import type ts from "typescript";
import type { TSESTree } from "@typescript-eslint/utils";
import { getCallbackReturnCall } from "./get-callback-return-call";
import { isCallbackFunctionNode } from "./is-callback-function-node";
import { isExternalOrigin } from "./is-external-origin";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";
import { isTrySafeCall } from "./is-try-safe-call";
import { isUnknownOrAnyType } from "#/utils/type-aware/is-unknown-or-any-type";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
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

  const calleeType = typeContext.services.getTypeAtLocation(sourceCall.callee);
  const hasUnknownOrAnyCallee = isUnknownOrAnyType(calleeType);
  if (hasUnknownOrAnyCallee) {
    return null;
  }

  const sourceSymbol = typeContext.services.getSymbolAtLocation(sourceCall.callee);
  if (!sourceSymbol) {
    return null;
  }

  const declarations = resolveAliasSymbol(
    sourceSymbol,
    typeContext,
  ).getDeclarations() ?? [];
  const lacksDeclarations = declarations.length === 0;
  if (lacksDeclarations) {
    return null;
  }

  const origins = new Set(
    declarations.map((declaration: ts.Declaration) =>
      isExternalOrigin(declaration, typeContext.services.program),
    ),
  );
  const hasSingleOrigin = origins.size === 1;
  if (!hasSingleOrigin) {
    return null;
  }

  return origins.has(false) ? sourceCall : null;
}
