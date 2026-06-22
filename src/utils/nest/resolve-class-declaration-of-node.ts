import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import tslib from "typescript";

export function resolveClassDeclarationOfNode(
  node: TSESTree.Node,
  typeContext: TypeContext,
): { declaration: ts.ClassDeclaration; name: string } | null {
  const type = typeContext.services.getTypeAtLocation(node);
  const isAnyOrUnknown = Boolean(
    type.flags & (tslib.TypeFlags.Any | tslib.TypeFlags.Unknown),
  );
  if (isAnyOrUnknown) {
    return null;
  }

  const symbol = type.getSymbol();
  if (!symbol) {
    return null;
  }

  const resolvedSymbol = resolveAliasSymbol(symbol, typeContext);
  const declaration = (resolvedSymbol.getDeclarations() ?? []).find(
    (candidate: ts.Declaration): candidate is ts.ClassDeclaration =>
      tslib.isClassDeclaration(candidate),
  );
  if (!declaration) {
    return null;
  }

  return { declaration, name: resolvedSymbol.getName() };
}
