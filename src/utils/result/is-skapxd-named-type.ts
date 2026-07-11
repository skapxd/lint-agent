import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";

export function isSkapxdNamedType(type: ts.Type, names: readonly string[], typeContext: TypeContext) {
  function isSkapxdSymbol(symbol: ts.Symbol | undefined) {
    return Boolean(
      symbol &&
        names.includes(symbol.getName()) &&
        isSymbolFromSkapxdResult(symbol, typeContext),
    );
  }

  return [type.aliasSymbol, type.symbol].some(isSkapxdSymbol);
}
