import type { RuleNode, TypeContext } from "#/utils/rule-authoring/rule-types";
import ts from "typescript";

export function resolveAliasSymbol(symbol: ts.Symbol, typeContext: TypeContext) {
  return symbol.flags & ts.SymbolFlags.Alias
    ? typeContext.checker.getAliasedSymbol(symbol)
    : symbol;
}
