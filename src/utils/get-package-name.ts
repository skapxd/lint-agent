// @ts-nocheck
import { trySafe } from "@skapxd/result";
import fs from "node:fs";
import path from "node:path";

const packageNameByDir = new Map();

// Resuelve el `name` del package.json más cercano hacia arriba desde un archivo.
// Robusto ante cualquier layout (node_modules, pnpm, workspace link, monorepo):
// se basa en la identidad real del paquete, no en la forma de la ruta.
export function getPackageName(fileName) {
  const visited = [];
  let dir = path.dirname(fileName);

  while (true) {
    if (packageNameByDir.has(dir)) {
      const cached = packageNameByDir.get(dir);
      for (const visitedDir of visited) packageNameByDir.set(visitedDir, cached);
      return cached;
    }

    visited.push(dir);

    const packageJsonPath = path.join(dir, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      const parsed = trySafe(() =>
        JSON.parse(fs.readFileSync(packageJsonPath, "utf8")),
      );
      const name = parsed.ok ? (parsed.value.name ?? null) : null;
      for (const visitedDir of visited) packageNameByDir.set(visitedDir, name);
      return name;
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      for (const visitedDir of visited) packageNameByDir.set(visitedDir, null);
      return null;
    }

    dir = parent;
  }
}
