import { isAbsolute, relative } from "node:path";

export function isInsideDirectory(directory: string, filePath: string) {
  const relativePath = relative(directory, filePath);
  const isSameDirectory = relativePath.length === 0;
  const escapesDirectory =
    relativePath.startsWith("..") || isAbsolute(relativePath);

  return isSameDirectory || !escapesDirectory;
}
