import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSkapxdNestSourceFile } from "./is-skapxd-nest-source-file";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";

export function isSymbolFromSkapxdNest(
  symbol: ts.Symbol,
  typeContext: TypeContext,
  packageName: string,
) {
  const resolvedSymbol = resolveAliasSymbol(symbol, typeContext);

  return (resolvedSymbol.getDeclarations() ?? []).some((declaration: ts.Declaration) =>
    isSkapxdNestSourceFile(declaration.getSourceFile().fileName, packageName),
  );
}
