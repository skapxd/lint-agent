import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSymbolFromSkapxdNest } from "#/utils/nest/is-symbol-from-skapxd-nest";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import tslib from "typescript";

export function isClassDecoratedBySkapxdNest(
  classDeclaration: ts.ClassDeclaration | ts.ClassExpression,
  typeContext: TypeContext,
  decoratorNames: string[],
  source: string,
) {
  const decorators = tslib.canHaveDecorators(classDeclaration)
    ? (tslib.getDecorators(classDeclaration) ?? [])
    : [];

  return decorators.some((decorator: ts.Decorator) => {
    const expression = decorator.expression;
    const callee = tslib.isCallExpression(expression)
      ? expression.expression
      : expression;
    const isIdentifierCallee = tslib.isIdentifier(callee);
    if (!isIdentifierCallee) {
      return false;
    }

    const symbol = typeContext.checker.getSymbolAtLocation(callee);
    const lacksSymbol = !symbol;
    if (lacksSymbol) {
      return false;
    }

    const resolvedSymbol = resolveAliasSymbol(symbol, typeContext);
    const hasConfiguredName = decoratorNames.includes(resolvedSymbol.getName());
    if (!hasConfiguredName) {
      return false;
    }

    return isSymbolFromSkapxdNest(symbol, typeContext, source);
  });
}
