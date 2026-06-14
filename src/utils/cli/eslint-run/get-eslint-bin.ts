import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getCliEntrypointPath } from "#/utils/cli/env/get-cli-entrypoint-path";

export function getEslintBin() {
  const require = createRequire(pathToFileURL(getCliEntrypointPath()).href);
  const packageJsonPath = require.resolve("eslint/package.json");
  const packageRoot = path.dirname(packageJsonPath);

  return path.join(packageRoot, "bin", "eslint.js");
}
