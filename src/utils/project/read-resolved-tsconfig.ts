import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { dirname } from "node:path";
import ts from "typescript";
import { trySafe } from "@skapxd/result";

// Lee y RESUELVE un tsconfig con la API de TypeScript: soporta comentarios
// (JSONC) y la cadena de `extends` — el flag puede venir heredado de un
// preset base y sigue contando.
export function readResolvedTsconfig(tsconfigPath: string) {
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

  const lacksParsedTsconfig = !parsed.ok || !parsed.value;
  if (lacksParsedTsconfig) {
    return null;
  }

  return parsed.value.options;
}
