import { existsSync } from "node:fs";
import { join } from "node:path";

type ExportCondition = {
  types?: unknown;
};

type ExportValue = string | Record<string, unknown>;

type UntypedExportViolation = {
  condition: string;
  kind: "missing-file" | "untyped" | "wrong-flavor";
  subpath: string;
};

// Recorre el campo `exports` de un package.json y devuelve las violaciones
// del contrato de tipos duales: cada condicion `import`/`require` debe ser
// un objeto con su PROPIO `types` (import → .d.mts, require → .d.ts/.d.cts)
// y el archivo debe existir. Un `types` unico a nivel del subpath es el bug
// "FalseCJS": consumidores ESM con moduleResolution node16 reciben tipos CJS.
export function getUntypedExportConditions(
  exportsField: Record<string, unknown>,
  packageDir: string,
): UntypedExportViolation[] {
  const violations: UntypedExportViolation[] = [];
  const entries: Array<[string, ExportValue]> =
    "import" in exportsField || "require" in exportsField
      ? [[".", exportsField]]
      : Object.entries(exportsField).filter(
          (entry): entry is [string, ExportValue] =>
            typeof entry[1] === "string" ||
            (typeof entry[1] === "object" && entry[1] !== null),
        );

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

      const target = value[condition] as ExportCondition | undefined;

      const lacksTypedTarget = !target || typeof target !== "object" || typeof target.types !== "string";
      if (lacksTypedTarget) {
        violations.push({ kind: "untyped", condition, subpath });
        continue;
      }

      const typesPath = target.types as string;
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
