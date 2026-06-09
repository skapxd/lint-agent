// @ts-nocheck
import ts from "typescript";

export function resolveAliasSymbol(symbol, typeContext) {
  return symbol.flags & ts.SymbolFlags.Alias
    ? typeContext.checker.getAliasedSymbol(symbol)
    : symbol;
}
