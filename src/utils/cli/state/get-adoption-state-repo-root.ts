import { execFileSync } from "node:child_process";
import { trySafe } from "@skapxd/result";
import { getProjectRoot } from "#/utils/cli/env/get-project-root";

export function getAdoptionStateRepoRoot(targetPath: string) {
  const projectRoot = getProjectRoot(targetPath);
  const gitRoot = trySafe(() =>
    execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim(),
  );

  if (gitRoot.ok) {
    return gitRoot.value;
  }

  return projectRoot;
}
