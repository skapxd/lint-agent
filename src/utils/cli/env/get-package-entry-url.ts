import path from "node:path";
import { pathToFileURL } from "node:url";
import { getCliEntrypointPath } from "./get-cli-entrypoint-path";

export function getPackageEntryUrl() {
  const cliDirectory = path.dirname(getCliEntrypointPath());

  return pathToFileURL(path.join(cliDirectory, "index.mjs")).href;
}
