import type { LegacyAstNode } from "#/utils/rule-types";
import picomatch from "picomatch";

// Matching de rutas con globs delegado a picomatch (el motor que usan
// fast-glob, chokidar y vitest). Dos ergonomías propias:
// - separadores de Windows normalizados, mismo glob en cualquier sistema;
// - un patrón sin prefijo (`src/index.ts`, `*.config.*`) matchea en
//   cualquier carpeta — se le antepone `**/`.
export function matchesAnyGlob(filePath: LegacyAstNode, globs: LegacyAstNode) {
  const normalized = filePath.replaceAll("\\", "/");

  return globs.some((glob: LegacyAstNode) => {
    const anchored =
      glob.startsWith("/") || glob.startsWith("**") ? glob : `**/${glob}`;

    return picomatch(anchored)(normalized);
  });
}
