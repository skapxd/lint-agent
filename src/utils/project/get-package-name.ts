import { trySafe } from "@skapxd/result";
import fs from "node:fs";
import path from "node:path";

const packageNameByDir = new Map<string, string | null>();

// Resuelve el `name` del package.json más cercano hacia arriba desde un archivo.
// Robusto ante cualquier layout (node_modules, pnpm, workspace link, monorepo):
// se basa en la identidad real del paquete, no en la forma de la ruta.
export function getPackageName(fileName: string): string | null {
  const visited: string[] = [];
  let dir = path.dirname(fileName);

  while (true) {
    const hasPackageNameByDir = packageNameByDir.has(dir);
    if (hasPackageNameByDir) {
      const cached = packageNameByDir.get(dir) ?? null;
      for (const visitedDir of visited) packageNameByDir.set(visitedDir, cached);
      return cached;
    }

    visited.push(dir);

    const packageJsonPath = path.join(dir, "package.json");

    const existsSyncFs = fs.existsSync(packageJsonPath);
    if (existsSyncFs) {
      const parsed = trySafe<string | null>(() => {
        const packageJson: unknown = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8"),
        );

        const lacksObjectShape = typeof packageJson !== "object" || packageJson === null;
        if (lacksObjectShape) {
          return null;
        }

        const packageName = "name" in packageJson ? packageJson.name : undefined;

        return typeof packageName === "string" ? packageName : null;
      });
      const name = parsed.ok ? parsed.value ?? null : null;
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
