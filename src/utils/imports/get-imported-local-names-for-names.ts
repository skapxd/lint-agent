import type { TSESTree } from "@typescript-eslint/utils";
import { getImportedLocalNames } from "#/utils/imports/get-imported-local-names";

export function getImportedLocalNamesForNames(
  program: TSESTree.Program,
  moduleSource: string,
  importedNames: readonly string[],
) {
  const namesFromSource = getImportedLocalNames(program, moduleSource);
  const localNames = new Set<string>();

  for (const statement of program.body) {
    const isDifferentSource = statement.type !== "ImportDeclaration" ||
      statement.source.value !== moduleSource;
    if (isDifferentSource) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      const isTrackedSpecifier = specifier.type === "ImportSpecifier" &&
        specifier.imported.type === "Identifier" &&
        importedNames.includes(specifier.imported.name) &&
        namesFromSource.has(specifier.local.name);
      if (isTrackedSpecifier) {
        localNames.add(specifier.local.name);
      }
    }
  }

  return localNames;
}
