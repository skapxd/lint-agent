import type ts from "typescript";
import type { TSESTree } from "@typescript-eslint/utils";
import { isUnknownOrAnyType } from "#/utils/type-aware/is-unknown-or-any-type";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function getCallOriginDeclarations(
  call: TSESTree.CallExpression,
  typeContext: TypeContext,
): ts.Declaration[] {
  const calleeType = typeContext.services.getTypeAtLocation(call.callee);
  const hasUnknownOrAnyCallee = isUnknownOrAnyType(calleeType);
  if (hasUnknownOrAnyCallee) {
    return [];
  }

  const signatureDeclarations = calleeType
    .getCallSignatures()
    .map((signature: ts.Signature) => signature.getDeclaration());
  const hasSignatureDeclarations = signatureDeclarations.length > 0;
  if (hasSignatureDeclarations) {
    return signatureDeclarations;
  }

  const sourceSymbol = typeContext.services.getSymbolAtLocation(call.callee);
  if (!sourceSymbol) {
    return [];
  }

  return resolveAliasSymbol(sourceSymbol, typeContext).getDeclarations() ?? [];
}
