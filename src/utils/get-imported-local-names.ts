// @ts-nocheck
// Nombres locales importados desde un módulo concreto en el archivo.
// Comparar decoradores contra esta lista evita falsos positivos con
// decoradores propios que casualmente tengan el mismo nombre.
export function getImportedLocalNames(program, moduleSource) {
  const names = new Set();

  for (const statement of program.body) {
    if (
      statement.type !== "ImportDeclaration" ||
      statement.source.value !== moduleSource
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      if (specifier.type === "ImportSpecifier") {
        names.add(specifier.local.name);
      }
    }
  }

  return names;
}
