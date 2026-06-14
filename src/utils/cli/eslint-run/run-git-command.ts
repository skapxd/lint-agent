import { execFileSync } from "node:child_process";
import type { ExecFileSyncOptionsWithStringEncoding } from "node:child_process";
import process from "node:process";
import { trySafe } from "@skapxd/result";

export function runGitCommand(
  args: readonly string[],
  options: Partial<ExecFileSyncOptionsWithStringEncoding> = {},
  failureMessage?: string,
) {
  const result = trySafe(() =>
    execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
      ...options,
    }),
  );

  if (result.ok) {
    return result.value;
  }

  if (failureMessage) {
    console.error(failureMessage);
    process.exitCode = 1;
    return null;
  }

  return "";
}
