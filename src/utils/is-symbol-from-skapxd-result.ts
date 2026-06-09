// @ts-nocheck
import { isSkapxdResultSourceFile } from "./is-skapxd-result-source-file";
import { resolveAliasSymbol } from "./resolve-alias-symbol";

export function isSymbolFromSkapxdResult(symbol, typeContext) {
  const resolvedSymbol = resolveAliasSymbol(symbol, typeContext);

  return (resolvedSymbol.getDeclarations() ?? []).some((declaration) =>
    isSkapxdResultSourceFile(declaration.getSourceFile().fileName),
  );
}
