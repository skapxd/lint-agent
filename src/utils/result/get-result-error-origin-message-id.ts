import ts from "typescript";
import { getTrySafeSourceCall } from "./get-try-safe-source-call";
import { isExternalOrigin } from "./is-external-origin";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import type {
  NoRethrowResultErrorMessageId,
  RawResultError,
} from "./no-rethrow-result-error-types";
import type {
  RuleSourceCode,
  TypeContext,
} from "#/utils/rule-authoring/rule-types";

export function getResultErrorOriginMessageId(
  rawError: RawResultError,
  sourceCode: RuleSourceCode,
  typeContext: TypeContext,
): NoRethrowResultErrorMessageId {
  const errorType = typeContext.services.getTypeAtLocation(rawError.errorExpression);
  const hasAnyError = (errorType.flags & ts.TypeFlags.Any) !== 0;
  if (hasAnyError) {
    return "rethrowResultError";
  }

  const sourceCall = getTrySafeSourceCall(
    rawError.resultExpression,
    sourceCode,
    typeContext,
  );
  const sourceSymbol = sourceCall
    ? typeContext.services.getSymbolAtLocation(sourceCall.callee)
    : null;
  if (!sourceSymbol) {
    return "rethrowResultError";
  }

  const declarations = resolveAliasSymbol(
    sourceSymbol,
    typeContext,
  ).getDeclarations() ?? [];
  const lacksDeclarations = declarations.length === 0;
  if (lacksDeclarations) {
    return "rethrowResultError";
  }

  const origins = new Set(
    declarations.map((declaration: ts.Declaration) =>
      isExternalOrigin(declaration, typeContext.services.program),
    ),
  );
  const hasSingleOrigin = origins.size === 1;
  if (!hasSingleOrigin) {
    return "rethrowResultError";
  }

  return origins.has(true) ? "rethrowRuntimeError" : "rethrowDomainError";
}
