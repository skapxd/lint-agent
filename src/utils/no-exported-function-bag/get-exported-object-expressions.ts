import type { TSESTree } from "@typescript-eslint/utils";
import { getObjectExpressionFromExpression } from "#/utils/no-exported-function-bag/get-object-expression-from-expression";

export type ExportedObjectExpression = {
  exportName: string;
  node: TSESTree.ObjectExpression;
  reportNode: TSESTree.Node;
};

/**
 * ### Contrato de exportacion local
 *
 * Esta utilidad reduce todas las formas locales de exportar un objeto a una lista
 * uniforme, sin perseguir re-exports de otros modulos ni inferir intencion por
 * nombres.
 *
 * ```ts
 * export const helpers = { a() {}, b() {} };
 * const local = { a() {}, b() {} };
 * export { local as helpers };
 * ```
 */
export function getExportedObjectExpressions(
  program: TSESTree.Program,
  localObjectDeclarations: ReadonlyMap<string, TSESTree.ObjectExpression>,
) {
  const exportedObjectExpressions: ExportedObjectExpression[] = [];

  function getLocalOrInlineObjectExpression(node: TSESTree.Node) {
    const inlineObjectExpression = getObjectExpressionFromExpression(node);
    const hasInlineObjectExpression = inlineObjectExpression !== undefined;
    if (hasInlineObjectExpression) {
      return inlineObjectExpression;
    }

    const isIdentifierNode = node.type === "Identifier";
    if (!isIdentifierNode) {
      return undefined;
    }

    return localObjectDeclarations.get(node.name);
  }

  function addVariableDeclarationExports(declaration: TSESTree.VariableDeclaration) {
    for (const declarator of declaration.declarations) {
      const declaratorId = declarator.id;
      const hasIdentifierName = declaratorId.type === "Identifier";
      if (!hasIdentifierName) {
        continue;
      }

      const objectExpression = getObjectExpressionFromExpression(declarator.init);
      const hasObjectExpressionInitializer = objectExpression !== undefined;
      if (!hasObjectExpressionInitializer) {
        continue;
      }

      exportedObjectExpressions.push({
        exportName: declaratorId.name,
        node: objectExpression,
        reportNode: declaratorId,
      });
    }
  }

  function addLocalExportSpecifier(specifier: TSESTree.ExportSpecifier) {
    const localName = specifier.local.type === "Identifier"
      ? specifier.local.name
      : String(specifier.local.value);
    const objectExpression = localObjectDeclarations.get(localName);
    const hasObjectExpressionDeclaration = objectExpression !== undefined;
    if (!hasObjectExpressionDeclaration) {
      return;
    }

    const exportName = specifier.exported.type === "Identifier"
      ? specifier.exported.name
      : String(specifier.exported.value);

    exportedObjectExpressions.push({
      exportName,
      node: objectExpression,
      reportNode: specifier,
    });
  }

  function addDefaultExport(statement: TSESTree.ExportDefaultDeclaration) {
    const objectExpression = getLocalOrInlineObjectExpression(statement.declaration);
    const lacksObjectExpressionDeclaration = objectExpression === undefined;
    if (lacksObjectExpressionDeclaration) {
      return;
    }

    exportedObjectExpressions.push({
      exportName: "default",
      node: objectExpression,
      reportNode: statement,
    });
  }

  function addInlineExportDeclaration(
    declaration: TSESTree.NamedExportDeclarations,
  ) {
    const isVariableDeclaration = declaration.type === "VariableDeclaration";
    if (!isVariableDeclaration) {
      return;
    }

    addVariableDeclarationExports(declaration);
  }

  for (const statement of program.body) {
    const isDefaultExportDeclaration = statement.type === "ExportDefaultDeclaration";
    if (isDefaultExportDeclaration) {
      addDefaultExport(statement);
      continue;
    }

    const isNamedExportDeclaration = statement.type === "ExportNamedDeclaration";
    if (!isNamedExportDeclaration) {
      continue;
    }

    const inlineDeclaration = statement.declaration;
    const hasInlineDeclaration = inlineDeclaration !== null;
    if (hasInlineDeclaration) {
      addInlineExportDeclaration(inlineDeclaration);
      continue;
    }

    const exportsFromAnotherModule = statement.source !== null;
    if (exportsFromAnotherModule) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      addLocalExportSpecifier(specifier);
    }
  }

  return exportedObjectExpressions;
}
