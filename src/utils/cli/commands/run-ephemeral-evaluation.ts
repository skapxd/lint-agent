import path from "node:path";
import { trySafe } from "@skapxd/result";
import { detectCliPreset } from "#/utils/project/detect-cli-preset";
import { createEphemeralConfig } from "#/utils/cli/eslint-run/create-ephemeral-config";
import { createLintTargetPattern } from "#/utils/cli/eslint-run/create-lint-target-pattern";
import { getProjectRoot } from "#/utils/cli/env/get-project-root";
import { omitProjectServiceParseErrorResults } from "#/utils/cli/eslint-run/omit-project-service-parse-error-results";
import { removeFileIfExists } from "#/utils/cli/eslint-run/remove-file-if-exists";
import { runEslintJson } from "#/utils/cli/eslint-run/run-eslint-json";
import { summarizeLintResults } from "#/utils/cli/output/machine/summarize-lint-results";
import { toLintFileResults } from "#/utils/cli/output/machine/to-lint-file-results";
import type { CliPreset, SkapxdLintOutput } from "#/utils/cli/types";

export function runEphemeralEvaluation(
  rawTargetPath: string,
  explicitPreset: CliPreset | null,
  includeTests: boolean,
) {
  const targetPath = path.resolve(rawTargetPath);
  const projectRoot = getProjectRoot(targetPath);
  const lintTargetPattern = createLintTargetPattern(targetPath, projectRoot);
  const preset = explicitPreset ?? detectCliPreset(projectRoot);
  const configPath = createEphemeralConfig(projectRoot, preset, includeTests);

  const lintResults = trySafe(() =>
    runEslintJson(projectRoot, configPath, lintTargetPattern),
  );
  removeFileIfExists(configPath);

  if (!lintResults.ok) {
    throw lintResults.error;
  }

  const filteredResults = omitProjectServiceParseErrorResults(lintResults.value);
  const files = toLintFileResults(filteredResults.results);
  const summary = summarizeLintResults(files);
  const status =
    summary.errorCount > 0 || summary.warningCount > 0 ? "findings" : "ok";
  const output: SkapxdLintOutput = {
    configDeleted: false,
    errorCount: summary.errorCount,
    files,
    mode: "evaluate",
    omittedFileCount: filteredResults.omittedFileCount,
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
