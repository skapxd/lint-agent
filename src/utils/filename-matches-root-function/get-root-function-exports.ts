import type { TSESTree } from "@typescript-eslint/utils";
import { getRootFunctionEntries } from "#/utils/ast/get-root-function-entries";
import { getExportedIdentifierName } from "./get-exported-identifier-name";

type RootFunctionExport = {
  exportName: string;
  node: TSESTree.Node;
};

export function getRootFunctionExports(program: TSESTree.Program) {
  const exportedNamesByLocalName = new Map<string, string>();
  const rootFunctions = program.body.flatMap((statement: TSESTree.Node) =>
    getRootFunctionEntries(statement),
  );

  for (const statement of program.body) {
    const isNamedValueExport =
      statement.type === "ExportNamedDeclaration" &&
      statement.exportKind !== "type";

    if (!isNamedValueExport) {
      continue;
    }

    for (const rootFunction of getRootFunctionEntries(statement)) {
      exportedNamesByLocalName.set(rootFunction.name, rootFunction.name);
    }

    for (const specifier of statement.specifiers) {
      const isValueSpecifier = specifier.exportKind !== "type";

      if (!isValueSpecifier) {
        continue;
      }

      exportedNamesByLocalName.set(
        getExportedIdentifierName(specifier.local),
        getExportedIdentifierName(specifier.exported),
      );
    }
  }

  return rootFunctions.flatMap((rootFunction): RootFunctionExport[] => {
    const exportName = exportedNamesByLocalName.get(rootFunction.name);

    return exportName ? [{ exportName, node: rootFunction.node }] : [];
  });
}
