import path from "node:path";

export function formatCompactPath(filePath: string, rootPath: string | null) {
  const hasRootPath = rootPath !== null && rootPath.length > 0;
  const filePathIsAbsolute = path.isAbsolute(filePath);
  const shouldUseRelativePath = hasRootPath && filePathIsAbsolute;

  if (shouldUseRelativePath) {
    return path.relative(rootPath, filePath);
  }

  return filePath;
}
