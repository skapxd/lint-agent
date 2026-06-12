import { existsSync } from "node:fs";
import { join } from "node:path";

// Comprueba si en la raiz del proyecto existe alguno de los archivos ancla.
// Solo puede verificar patrones literales (sin comodines): a un patron tipo
// "**/src/main.ts" se le quita el prefijo "**/" y se prueba como ruta; si
// aun contiene comodines, no es verificable y se descarta.
export function anchorFileExists(
  rootDir: string,
  anchorFilePatterns: readonly string[],
) {
  return anchorFilePatterns.some((pattern: string) => {
    const literal = pattern.replace(/^\*\*\//, "");

    const isGlobPattern = literal.includes("*") || literal.includes("{");
    if (isGlobPattern) {
      return false;
    }

    return existsSync(join(rootDir, literal));
  });
}
