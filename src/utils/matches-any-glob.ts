// @ts-nocheck
import { globToRegExp } from "./glob-to-reg-exp";

// Matching de rutas de archivo con globs. Normaliza los separadores de
// Windows para que el mismo patrón funcione en cualquier sistema.
export function matchesAnyGlob(filePath, globs) {
  const normalized = filePath.replaceAll("\\", "/");

  return globs.some((glob) => globToRegExp(glob).test(normalized));
}
