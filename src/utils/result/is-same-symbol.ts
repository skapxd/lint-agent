import type { TSESTree } from "@typescript-eslint/utils";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function isSameSymbol(
  first: TSESTree.Identifier,
  second: TSESTree.Identifier,
  typeContext: TypeContext,
) {
  const firstSymbol = typeContext.services.getSymbolAtLocation(first);
  const secondSymbol = typeContext.services.getSymbolAtLocation(second);
  const lacksSymbol = !firstSymbol || !secondSymbol;
  if (lacksSymbol) {
    return false;
  }

  return resolveAliasSymbol(firstSymbol, typeContext) ===
    resolveAliasSymbol(secondSymbol, typeContext);
}
