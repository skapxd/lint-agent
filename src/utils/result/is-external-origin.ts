import type ts from "typescript";

export function isExternalOrigin(declaration: ts.Node, program: ts.Program) {
  const sourceFile = declaration.getSourceFile();
  const isDefaultLibrary = program.isSourceFileDefaultLibrary(sourceFile);
  if (isDefaultLibrary) {
    return true;
  }

  const isExternalLibrary = program.isSourceFileFromExternalLibrary(sourceFile);
  if (isExternalLibrary) {
    return true;
  }

  const fileName = sourceFile.fileName;
  const isRemoteUrl = /^https?:\/\//u.test(fileName);
  if (isRemoteUrl) {
    return true;
  }

  const isNodeModulesPath = /[\\/]node_modules[\\/]/u.test(fileName);
  if (isNodeModulesPath) {
    return true;
  }

  const isDenoCachePath = /[\\/]deno[\\/](deps|npm|registry)[\\/]/u.test(fileName);
  const isJsrCachePath = /[\\/]jsr\.io[\\/]/u.test(fileName);

  return isDenoCachePath || isJsrCachePath;
}
