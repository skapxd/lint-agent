import { existsSync } from "node:fs";
import { join } from "node:path";
import { isExportCondition } from "#/utils/project/is-export-condition";
import { isExportValue } from "#/utils/project/is-export-value";

type ExportValue = string | Record<string, unknown>;

type UntypedExportViolation = {
  condition: string;
  kind: "missing-file" | "untyped" | "wrong-flavor";
  subpath: string;
};

/**
 * Recorre `package.json#exports` y devuelve las ramas que rompen el contrato de tipos duales. El problema de alto nivel es FalseCJS: consumidores ESM con `moduleResolution: node16` reciben tipos CJS cuando `import` y `require` comparten un `types` ambiguo.
 *
 * ### Reglas
 * Un export string es no tipado; cada condicion `import`/`require` debe ser objeto con su propio `types`; `import` exige `.d.mts`; `require` exige `.d.ts` o `.d.cts`; el archivo declarado debe existir.
 *
 * ### Ejemplo
 * ```ts
 * getUntypedExportConditions({ ".": { import: { default: "./dist/index.mjs", types: "./dist/index.d.mts" }, require: { default: "./dist/index.js" } } }, packageDir);
 * // -> [{ kind: "untyped", condition: "require", subpath: "." }]
 * ```
 */
export function getUntypedExportConditions(
  exportsField: Record<string, unknown>,
  packageDir: string,
): UntypedExportViolation[] {
  const violations: UntypedExportViolation[] = [];
  const entries: Array<[string, ExportValue]> = [];
  const hasRootConditions = "import" in exportsField || "require" in exportsField;
  if (hasRootConditions) {
    entries.push([".", exportsField]);
  }

  if (!hasRootConditions) {
    for (const [subpath, value] of Object.entries(exportsField)) {
      const exportEntries: Array<[string, ExportValue]> = isExportValue(value)
        ? [[subpath, value]]
        : [];
      entries.push(...exportEntries);
    }
  }

  for (const [subpath, value] of entries) {
    const isSubpathPackageJson = subpath === "./package.json";
    if (isSubpathPackageJson) {
      continue;
    }

    const isTypeofValueString = typeof value === "string";
    if (isTypeofValueString) {
      violations.push({ kind: "untyped", condition: "todas", subpath });
      continue;
    }

    for (const condition of ["import", "require"]) {
      const omitsExportBranch = !(condition in value);
      if (omitsExportBranch) {
        continue;
      }

      const target = value[condition];

      const lacksTypedTarget = !isExportCondition(target);
      if (lacksTypedTarget) {
        violations.push({ kind: "untyped", condition, subpath });
        continue;
      }

      const typesPath = target.types;
      const expectsEsmTypes = condition === "import";
      const flavorOk = expectsEsmTypes
        ? typesPath.endsWith(".d.mts")
        : typesPath.endsWith(".d.ts") || typesPath.endsWith(".d.cts");

      if (!flavorOk) {
        violations.push({ kind: "wrong-flavor", condition, subpath });
        continue;
      }

      const typesFileExists = existsSync(join(packageDir, typesPath));
      if (!typesFileExists) {
        violations.push({ kind: "missing-file", condition, subpath });
      }
    }
  }

  return violations;
}
