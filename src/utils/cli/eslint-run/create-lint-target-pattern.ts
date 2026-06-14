import fs from "node:fs";
import path from "node:path";

const lintableGlob = "**/*.{js,cjs,mjs,ts,cts,mts,jsx,tsx}";

export function createLintTargetPattern(targetPath: string, projectRoot: string) {
  const stat = fs.statSync(targetPath);
  const isDirectory = stat.isDirectory();
  const relativeTarget = path.relative(projectRoot, targetPath);

  if (!isDirectory) {
    return relativeTarget || path.basename(targetPath);
  }

  const targetsProjectRoot = relativeTarget.length === 0;
  if (targetsProjectRoot) {
    return lintableGlob;
  }

  return path.join(relativeTarget, lintableGlob);
}
