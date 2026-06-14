import { spawnSync } from "node:child_process";
import process from "node:process";
import { getEslintBin } from "./get-eslint-bin";
import { parseEslintJson } from "./parse-eslint-json";

export function runEslintJson(
  projectRoot: string,
  configPath: string,
  targetPath: string,
) {
  const execution = spawnSync(
    process.execPath,
    [
      getEslintBin(),
      "--no-config-lookup",
      "--config",
      configPath,
      "--format",
      "json",
      targetPath,
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  const acceptedExitCode = execution.status === 0 || execution.status === 1;

  if (acceptedExitCode) {
    return parseEslintJson(execution.stdout);
  }

  throw new Error(execution.stderr || "ESLint fallo sin stderr.");
}
