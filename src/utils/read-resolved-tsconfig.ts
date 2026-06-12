import type { LegacyAstNode } from "#/utils/rule-types";
import { dirname } from "node:path";
import ts from "typescript";
import { trySafe } from "@skapxd/result";

// Lee y RESUELVE un tsconfig con la API de TypeScript: soporta comentarios
// (JSONC) y la cadena de `extends` — el flag puede venir heredado de un
// preset base y sigue contando.
export function readResolvedTsconfig(tsconfigPath: LegacyAstNode) {
  const parsed = trySafe(() => {
    const raw = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

    if (raw.error) {
      return null;
    }

    return ts.parseJsonConfigFileContent(
      raw.config,
      ts.sys,
      dirname(tsconfigPath),
    );
  });

  if (!parsed.ok || !parsed.value) {
    return null;
  }

  return parsed.value.options;
}
