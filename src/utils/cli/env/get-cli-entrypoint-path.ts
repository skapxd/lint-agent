import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export function getCliEntrypointPath() {
  const invokedPath = process.argv[1] ?? path.join(process.cwd(), "dist", "cli.mjs");

  return fs.realpathSync(path.resolve(invokedPath));
}
