import path from "node:path";
import process from "node:process";
import { runGitCommand } from "./run-git-command";

const lintableFile = /\.(c|m)?[jt]sx?$/;

export function getChangedLintFiles(base: string | null, cwd: string) {
  const rootOutput = runGitCommand(["rev-parse", "--show-toplevel"], { cwd });
  const root = rootOutput?.trim() || cwd;
  const range = base ? `${base}...HEAD` : "HEAD";
  const changed = runGitCommand(
    ["diff", "--name-only", "--diff-filter=ACMR", range],
    { cwd: root, stdio: ["pipe", "pipe", "inherit"] },
    "skapxd-lint --changed: git no pudo calcular los cambios.",
  );
  const hasGitFailure = changed === null;

  if (hasGitFailure) {
    return null;
  }

  const untracked = base
    ? ""
    : (runGitCommand(["ls-files", "--others", "--exclude-standard"], { cwd: root }) ??
      "");
  const lines = `${changed}\n${untracked}`
    .split("\n")
    .map((line) => line.trim());
  const files = [...new Set(lines)]
    .filter((file) => file.length > 0 && lintableFile.test(file))
    .map((file) => path.join(root, file));

  process.exitCode = undefined;

  return { files, root };
}
