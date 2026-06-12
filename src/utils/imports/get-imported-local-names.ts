import type { TSESTree } from "@typescript-eslint/utils";
// Nombres locales importados desde un módulo concreto en el archivo.
// Comparar decoradores contra esta lista evita falsos positivos con
// decoradores propios que casualmente tengan el mismo nombre.
export function getImportedLocalNames(program: TSESTree.Program, moduleSource: string) {
  const names = new Set<string>();

  for (const statement of program.body) {
    const isDifferentImportSource = statement.type !== "ImportDeclaration" ||
      statement.source.value !== moduleSource;
    if (
      isDifferentImportSource
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      const isImportSpecifierNode = specifier.type === "ImportSpecifier";
      if (isImportSpecifierNode) {
        names.add(specifier.local.name);
      }
    }
  }

  return names;
}
