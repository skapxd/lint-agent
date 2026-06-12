import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// Busca un archivo subiendo carpetas desde startDir. Se detiene en la raíz
// del proyecto (la carpeta con package.json) o del filesystem: no se sale
// del proyecto que se está linteando.
export function findProjectFile(startDir: string, fileName: string) {
  let current = startDir;

  while (true) {
    const candidate = join(current, fileName);

    if (existsSync(candidate)) {
      return candidate;
    }

    if (existsSync(join(current, "package.json"))) {
      return null;
    }

    const parent = dirname(current);

    if (parent === current) {
      return null;
    }

    current = parent;
  }
}
