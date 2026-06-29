import type { TSESTree } from "@typescript-eslint/utils";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";
import { getFunctionBagEntryName } from "#/utils/no-exported-function-bag/get-function-bag-entry-name";

export type ExportedFunctionBagEntry = {
  name: string;
  node: TSESTree.Node;
};

type ResolveLocalObjectExpression = (
  name: string,
) => TSESTree.ObjectExpression | undefined;

/**
 * ### Conteo AST-only
 *
 * Cuenta solo funciones que la sintaxis demuestra: methods, arrows/function
 * expressions directas y spreads locales que resuelven a object literals del
 * mismo archivo. Un spread importado queda fuera porque asumir su shape seria
 * una heuristica sin evidencia.
 *
 * ```ts
 * const shared = { parseA() {} };
 * export const parser = { ...shared, parseB() {} };
 * ```
 */
export function getExportedFunctionBagEntries(
  objectExpression: TSESTree.ObjectExpression,
  resolveLocalObjectExpression: ResolveLocalObjectExpression,
) {
  const visitedObjectExpressions = new Set<TSESTree.ObjectExpression>();

  function collectObjectFunctionEntries(currentObjectExpression: TSESTree.ObjectExpression): ExportedFunctionBagEntry[] {
    const alreadyVisitedObjectExpression = visitedObjectExpressions.has(
      currentObjectExpression,
    );
    if (alreadyVisitedObjectExpression) {
      return [];
    }

    visitedObjectExpressions.add(currentObjectExpression);

    return currentObjectExpression.properties.flatMap((property) =>
      getPropertyFunctionEntries(property),
    );
  }

  function getSpreadObjectExpression(argument: TSESTree.Node) {
    const unwrappedArgument = unwrapExpression(argument);
    const isInlineObjectExpression = unwrappedArgument.type === "ObjectExpression";
    if (isInlineObjectExpression) {
      return unwrappedArgument;
    }

    const isIdentifierArgument = unwrappedArgument.type === "Identifier";
    if (!isIdentifierArgument) {
      return undefined;
    }

    return resolveLocalObjectExpression(unwrappedArgument.name);
  }

  function getSpreadFunctionEntries(spreadElement: TSESTree.SpreadElement) {
    const spreadObjectExpression = getSpreadObjectExpression(spreadElement.argument);
    const hasResolvedSpreadObject = spreadObjectExpression !== undefined;
    if (!hasResolvedSpreadObject) {
      return [];
    }

    return collectObjectFunctionEntries(spreadObjectExpression);
  }

  function getPropertyFunctionEntries(property: TSESTree.ObjectLiteralElement) {
    const isSpreadElement = property.type === "SpreadElement";
    if (isSpreadElement) {
      return getSpreadFunctionEntries(property);
    }

    const isAccessorProperty = property.kind === "get" || property.kind === "set";
    if (isAccessorProperty) {
      return [];
    }

    const isMethodProperty = property.method;
    if (isMethodProperty) {
      return [{ name: getFunctionBagEntryName(property), node: property }];
    }

    const value = unwrapExpression(property.value);
    const hasFunctionValue = value.type === "ArrowFunctionExpression" ||
      value.type === "FunctionExpression";
    if (!hasFunctionValue) {
      return [];
    }

    return [{ name: getFunctionBagEntryName(property), node: property.value }];
  }

  return collectObjectFunctionEntries(objectExpression);
}
