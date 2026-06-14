import path from "node:path";
import { trySafe } from "@skapxd/result";
import { detectCliPreset } from "#/utils/project/detect-cli-preset";
import { createEphemeralConfig } from "./create-ephemeral-config";
import { createLintTargetPattern } from "./create-lint-target-pattern";
import { getProjectRoot } from "./get-project-root";
import { removeFileIfExists } from "./remove-file-if-exists";
import { runEslintJson } from "./run-eslint-json";
import { summarizeLintResults } from "./summarize-lint-results";
import { toLintFileResults } from "./to-lint-file-results";
import type { CliPreset, SkapxdLintOutput } from "./types";

export function runEphemeralEvaluation(
  rawTargetPath: string,
  explicitPreset: CliPreset | null,
) {
  const targetPath = path.resolve(rawTargetPath);
  const projectRoot = getProjectRoot(targetPath);
  const lintTargetPattern = createLintTargetPattern(targetPath, projectRoot);
  const preset = explicitPreset ?? detectCliPreset(projectRoot);
  const configPath = createEphemeralConfig(projectRoot, preset);

  const lintResults = trySafe(() =>
    runEslintJson(projectRoot, configPath, lintTargetPattern),
  );
  removeFileIfExists(configPath);

  if (!lintResults.ok) {
    throw lintResults.error;
  }

  const files = toLintFileResults(lintResults.value);
  const summary = summarizeLintResults(files);
  const status =
    summary.errorCount > 0 || summary.warningCount > 0 ? "findings" : "ok";
  const output: SkapxdLintOutput = {
    configDeleted: false,
    errorCount: summary.errorCount,
    files,
    mode: "evaluate",
    preset,
    status,
    targetPath,
    warningCount: summary.warningCount,
  };

  return {
    ...output,
    configDeleted: true,
  } satisfies SkapxdLintOutput;
}
