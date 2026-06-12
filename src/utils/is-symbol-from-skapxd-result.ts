import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-types";
import { isSkapxdResultSourceFile } from "./is-skapxd-result-source-file";
import { resolveAliasSymbol } from "./resolve-alias-symbol";

export function isSymbolFromSkapxdResult(symbol: ts.Symbol, typeContext: TypeContext) {
  const resolvedSymbol = resolveAliasSymbol(symbol, typeContext);

  return (resolvedSymbol.getDeclarations() ?? []).some((declaration: ts.Declaration) =>
    isSkapxdResultSourceFile(declaration.getSourceFile().fileName),
  );
}
