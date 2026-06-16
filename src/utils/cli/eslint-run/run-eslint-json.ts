import { spawnSync } from "node:child_process";
import process from "node:process";
import { getEslintBin } from "./get-eslint-bin";
import { parseEslintJson } from "./parse-eslint-json";

const BYTES_PER_KIBIBYTE = Number("1024");
const BYTES_PER_MEBIBYTE = BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE;
const ESLINT_JSON_MAX_BUFFER_MEBIBYTES = Number("100");
const ESLINT_JSON_MAX_BUFFER_BYTES =
  BYTES_PER_MEBIBYTE * ESLINT_JSON_MAX_BUFFER_MEBIBYTES;

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
      maxBuffer: ESLINT_JSON_MAX_BUFFER_BYTES,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  const acceptedExitCode = execution.status === 0 || execution.status === 1;

  if (acceptedExitCode) {
    return parseEslintJson(execution.stdout);
  }

  throw new Error(execution.stderr || "ESLint fallo sin stderr.");
}
