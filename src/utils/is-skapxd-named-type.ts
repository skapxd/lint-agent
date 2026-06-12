import type { LegacyAstNode } from "#/utils/rule-types";
import { isSymbolFromSkapxdResult } from "./is-symbol-from-skapxd-result";

export function isSkapxdNamedType(type: LegacyAstNode, names: LegacyAstNode, typeContext: LegacyAstNode) {
  return [
    type.aliasSymbol,
    type.symbol,
  ].some((symbol: LegacyAstNode) =>
    Boolean(
      symbol &&
        names.includes(symbol.getName()) &&
        isSymbolFromSkapxdResult(symbol, typeContext),
    ),
  );
}
