// @ts-nocheck
import { matchesAnyPattern } from "./matches-any-pattern";

// Mapa nombre local → source de los imports DE VALOR (no type) que vienen de
// código interno del proyecto y no están en la lista de permitidos.
export function getInternalValueImports(program, internalPatterns, allowedPatterns) {
  const imports = new Map();

  for (const statement of program.body) {
    if (statement.type !== "ImportDeclaration" || statement.importKind === "type") {
      continue;
    }

    const source = statement.source.value;

    if (
      !matchesAnyPattern(source, internalPatterns) ||
      matchesAnyPattern(source, allowedPatterns)
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      if (specifier.importKind === "type") {
        continue;
      }

      imports.set(specifier.local.name, source);
    }
  }

  return imports;
}
