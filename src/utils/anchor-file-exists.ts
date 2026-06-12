import type { LegacyAstNode } from "#/utils/rule-types";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Comprueba si en la raiz del proyecto existe alguno de los archivos ancla.
// Solo puede verificar patrones literales (sin comodines): a un patron tipo
// "**/src/main.ts" se le quita el prefijo "**/" y se prueba como ruta; si
// aun contiene comodines, no es verificable y se descarta.
export function anchorFileExists(rootDir: LegacyAstNode, anchorFilePatterns: LegacyAstNode) {
  return anchorFilePatterns.some((pattern: LegacyAstNode) => {
    const literal = pattern.replace(/^\*\*\//, "");

    if (literal.includes("*") || literal.includes("{")) {
      return false;
    }

    return existsSync(join(rootDir, literal));
  });
}
