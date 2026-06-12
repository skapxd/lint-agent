import type { LegacyAstNode } from "#/utils/rule-types";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Recorre el campo `exports` de un package.json y devuelve las violaciones
// del contrato de tipos duales: cada condicion `import`/`require` debe ser
// un objeto con su PROPIO `types` (import → .d.mts, require → .d.ts/.d.cts)
// y el archivo debe existir. Un `types` unico a nivel del subpath es el bug
// "FalseCJS": consumidores ESM con moduleResolution node16 reciben tipos CJS.
export function getUntypedExportConditions(exportsField: LegacyAstNode, packageDir: LegacyAstNode) {
  const violations = [];
  const entries =
    "import" in exportsField || "require" in exportsField
      ? [[".", exportsField]]
      : Object.entries(exportsField);

  for (const [subpath, value] of entries) {
    if (subpath === "./package.json") {
      continue;
    }

    if (typeof value === "string") {
      violations.push({ kind: "untyped", condition: "todas", subpath });
      continue;
    }

    for (const condition of ["import", "require"]) {
      if (!(condition in value)) {
        continue;
      }

      const target = value[condition];

      if (typeof target !== "object" || typeof target.types !== "string") {
        violations.push({ kind: "untyped", condition, subpath });
        continue;
      }

      const expectsEsmTypes = condition === "import";
      const flavorOk = expectsEsmTypes
        ? target.types.endsWith(".d.mts")
        : target.types.endsWith(".d.ts") || target.types.endsWith(".d.cts");

      if (!flavorOk) {
        violations.push({ kind: "wrong-flavor", condition, subpath });
        continue;
      }

      if (!existsSync(join(packageDir, target.types))) {
        violations.push({ kind: "missing-file", condition, subpath });
      }
    }
  }

  return violations;
}
