import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { trySafe } from "@skapxd/result";
import fs from "node:fs";
import path from "node:path";

type PackageJson = {
  name?: string;
};

const packageNameByDir = new Map();

// Resuelve el `name` del package.json más cercano hacia arriba desde un archivo.
// Robusto ante cualquier layout (node_modules, pnpm, workspace link, monorepo):
// se basa en la identidad real del paquete, no en la forma de la ruta.
export function getPackageName(fileName: string) {
  const visited = [];
  let dir = path.dirname(fileName);

  while (true) {
    const hasPackageNameByDir = packageNameByDir.has(dir);
    if (hasPackageNameByDir) {
      const cached = packageNameByDir.get(dir);
      for (const visitedDir of visited) packageNameByDir.set(visitedDir, cached);
      return cached;
    }

    visited.push(dir);

    const packageJsonPath = path.join(dir, "package.json");

    const existsSyncFs = fs.existsSync(packageJsonPath);
    if (existsSyncFs) {
      const parsed = trySafe<PackageJson>(() =>
        JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson,
      );
      const name = parsed.ok ? (parsed.value.name ?? null) : null;
      for (const visitedDir of visited) packageNameByDir.set(visitedDir, name);
      return name;
    }

    const parent = path.dirname(dir);

    const isParentDir = parent === dir;
    if (isParentDir) {
      for (const visitedDir of visited) packageNameByDir.set(visitedDir, null);
      return null;
    }

    dir = parent;
  }
}
