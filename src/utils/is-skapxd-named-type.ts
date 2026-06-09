// @ts-nocheck
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";

export function isSkapxdNamedType(type, names, typeContext) {
  return [
    type.aliasSymbol,
    type.symbol,
  ].some((symbol) =>
    Boolean(
      symbol &&
        names.includes(symbol.getName()) &&
        isSymbolFromSkapxdResult(symbol, typeContext),
    ),
  );
}
