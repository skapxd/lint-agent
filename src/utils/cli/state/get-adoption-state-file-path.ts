import crypto from "node:crypto";
import path from "node:path";
import { getAdoptionStateCacheDirectory } from "./get-adoption-state-cache-directory";
import { getAdoptionStateRepoRoot } from "./get-adoption-state-repo-root";

export function getAdoptionStateFilePath(targetPath: string) {
  const repoRoot = getAdoptionStateRepoRoot(targetPath);
  const repoKey = crypto.createHash("sha256").update(repoRoot).digest("hex");

  return path.join(getAdoptionStateCacheDirectory(), `${repoKey}.json`);
}
