// @ts-nocheck
import picomatch from "picomatch";

// Matching de rutas con globs delegado a picomatch (el motor que usan
// fast-glob, chokidar y vitest). Dos ergonomías propias:
// - separadores de Windows normalizados, mismo glob en cualquier sistema;
// - un patrón sin prefijo (`src/index.ts`, `*.config.*`) matchea en
//   cualquier carpeta — se le antepone `**/`.
export function matchesAnyGlob(filePath, globs) {
  const normalized = filePath.replaceAll("\\", "/");

  return globs.some((glob) => {
    const anchored =
      glob.startsWith("/") || glob.startsWith("**") ? glob : `**/${glob}`;

    return picomatch(anchored)(normalized);
  });
}
