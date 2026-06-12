import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { matchesAnyPattern } from "#/utils/matching/matches-any-pattern";

// Mapa nombre local → source de los imports DE VALOR (no type) que vienen de
// código interno del proyecto y no están en la lista de permitidos.
export function getInternalValueImports(
  program: RuleNode,
  internalPatterns: readonly string[],
  allowedPatterns: readonly string[],
) {
  const imports = new Map<string, string>();

  for (const statement of program.body) {
    const isNonValueImport = statement.type !== "ImportDeclaration" || statement.importKind === "type";
    if (isNonValueImport) {
      continue;
    }

    const source = statement.source.value;

    const hasStringImportSource = typeof source === "string";
    if (!hasStringImportSource) {
      continue;
    }

    const isExternalOrAllowedImport = !matchesAnyPattern(source, internalPatterns) ||
      matchesAnyPattern(source, allowedPatterns);
    if (
      isExternalOrAllowedImport
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      const isSpecifierImportKindType = specifier.importKind === "type";
      if (isSpecifierImportKindType) {
        continue;
      }

      imports.set(specifier.local.name, source);
    }
  }

  return imports;
}
