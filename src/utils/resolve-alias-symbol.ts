import type { LegacyAstNode } from "#/utils/rule-types";
import ts from "typescript";

export function resolveAliasSymbol(symbol: LegacyAstNode, typeContext: LegacyAstNode) {
  return symbol.flags & ts.SymbolFlags.Alias
    ? typeContext.checker.getAliasedSymbol(symbol)
    : symbol;
}
