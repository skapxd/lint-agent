import type { TSESTree } from "@typescript-eslint/utils";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import ts from "typescript";

export function getDeclaredSymbolType(
  symbol: ts.Symbol,
  fallbackNode: TSESTree.Node,
  typeContext: TypeContext,
): ts.Type {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (declaration) {
    return typeContext.checker.getTypeOfSymbolAtLocation(symbol, declaration);
  }

  const tsNode = typeContext.services.esTreeNodeToTSNodeMap.get(fallbackNode);

  return typeContext.checker.getTypeAtLocation(tsNode);
}
