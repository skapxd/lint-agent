import type { TSESTree } from "@typescript-eslint/utils";
import { getRootFunctionEntries } from "./get-root-function-entries";
import { getVariableDeclaratorName } from "./get-variable-declarator-name";
import { isClassBoundary } from "./is-class-boundary";

export type RootUnitEntry = {
  kind: "class" | "function";
  name: string;
  node: TSESTree.Node;
};

/**
 * ### Cierra el bypass entre funciones y clases raíz
 *
 * Una regla de unidad por archivo necesita conservar la clasificación probada de
 * funciones y ampliarla solo con fronteras de clase; de otro modo, una clase y su
 * helper top-level aparentan una única responsabilidad.
 *
 * ```ts
 * class Gateway {}
 * function readState() {}
 * // => Gateway, readState
 * ```
 */
export function getRootUnitEntries(statement: TSESTree.Node): RootUnitEntry[] {
  const rootFunctions = getRootFunctionEntries(statement).map((entry) => ({
    ...entry,
    kind: "function" as const,
  }));
  const declaration =
    statement.type === "ExportNamedDeclaration" ||
    statement.type === "ExportDefaultDeclaration"
      ? statement.declaration
      : statement;

  if (!declaration) {
    return [];
  }

  const isOverloadSignature = declaration.type === "TSDeclareFunction";
  if (isOverloadSignature) {
    return [
      {
        kind: "function",
        name: declaration.id?.name ?? "funcion anonima",
        node: declaration,
      },
    ];
  }

  if (isClassBoundary(declaration)) {
    return [
      {
        kind: "class",
        name: declaration.id?.name ?? "clase anonima",
        node: declaration,
      },
    ];
  }

  const isVariableDeclaration = declaration.type === "VariableDeclaration";
  if (!isVariableDeclaration) {
    return rootFunctions;
  }

  const entries: RootUnitEntry[] = [];

  for (const variableDeclarator of declaration.declarations) {
    const rootFunction = rootFunctions.find(
      (entry) => entry.node === variableDeclarator.init,
    );
    if (rootFunction) {
      entries.push(rootFunction);
      continue;
    }

    const initializer = variableDeclarator.init;
    if (!initializer) {
      continue;
    }

    const hasClassInitializer = isClassBoundary(initializer);
    if (!hasClassInitializer) {
      continue;
    }

    const name = getVariableDeclaratorName(variableDeclarator);

    entries.push({
      kind: "class",
      name: name === "helper" ? "clase anonima" : name,
      node: initializer,
    });
  }

  return entries;
}
