import type { LegacyAstNode } from "#/utils/rule-types";
import { isSkapxdResultSourceFile } from "./is-skapxd-result-source-file";
import { resolveAliasSymbol } from "./resolve-alias-symbol";

export function isSymbolFromSkapxdResult(symbol: LegacyAstNode, typeContext: LegacyAstNode) {
  const resolvedSymbol = resolveAliasSymbol(symbol, typeContext);

  return (resolvedSymbol.getDeclarations() ?? []).some((declaration: LegacyAstNode) =>
    isSkapxdResultSourceFile(declaration.getSourceFile().fileName),
  );
}
