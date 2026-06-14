import fs from "node:fs";
import path from "node:path";

export function getProjectRoot(targetPath: string) {
  const stat = fs.statSync(targetPath);
  const isDirectory = stat.isDirectory();

  if (isDirectory) {
    return targetPath;
  }

  return path.dirname(targetPath);
}
