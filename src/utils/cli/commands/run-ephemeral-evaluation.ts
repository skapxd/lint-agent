import path from "node:path";
import { realpathSync } from "node:fs";
import { Result, trySafe } from "@skapxd/result";
import { detectCliPreset } from "#/utils/project/detect-cli-preset";
import { createEphemeralConfig } from "#/utils/cli/eslint-run/create-ephemeral-config";
import { createEphemeralTypeConfig } from "#/utils/cli/tsconfig/create-ephemeral-type-config";
import { createAdoptionRuleSummaries } from "#/utils/cli/adoption/create-adoption-rule-summaries";
import { createLintTargetPattern } from "#/utils/cli/eslint-run/create-lint-target-pattern";
import { getProjectRoot } from "#/utils/cli/env/get-project-root";
import { omitProjectServiceParseErrorResults } from "#/utils/cli/eslint-run/omit-project-service-parse-error-results";
import { removeFileIfExists } from "#/utils/cli/eslint-run/remove-file-if-exists";
import { runEslintJson } from "#/utils/cli/eslint-run/run-eslint-json";
import { createReportGuidance } from "#/utils/cli/output/report/create-report-guidance";
import { summarizeLintResults } from "#/utils/cli/output/machine/summarize-lint-results";
import { toLintFileResults } from "#/utils/cli/output/machine/to-lint-file-results";
import type {
  CliExecutionError,
  CliPreset,
  SkapxdLintOutput,
} from "#/utils/cli/types";

export function runEphemeralEvaluation(
  rawTargetPath: string,
  explicitPreset: CliPreset | null,
  includeTests: boolean,
  useProjectTsconfig: boolean,
): Result<SkapxdLintOutput, CliExecutionError> {
  let configPath = "";
  const cleanupPaths: string[] = [];
  const evaluationOutput = trySafe(() => {
    const targetPath = realpathSync(path.resolve(rawTargetPath));
    const projectRoot = getProjectRoot(targetPath);
    const lintTargetPattern = createLintTargetPattern(targetPath, projectRoot);
    const preset = explicitPreset ?? detectCliPreset(projectRoot);
    const typeConfig = createEphemeralTypeConfig(projectRoot, useProjectTsconfig);
    if (typeConfig.path) {
      cleanupPaths.push(typeConfig.path);
    }
    configPath = createEphemeralConfig(
      projectRoot,
      preset,
      includeTests,
      typeConfig.path,
    );

    const lintResults = runEslintJson(projectRoot, configPath, lintTargetPattern);
    const filteredResults = omitProjectServiceParseErrorResults(lintResults);
    const files = toLintFileResults(filteredResults.results);
    const ruleSummaries = createAdoptionRuleSummaries(files);
    const summary = summarizeLintResults(files);
    const status =
      summary.errorCount > 0 || summary.warningCount > 0 ? "findings" : "ok";
    const output: SkapxdLintOutput = {
      configDeleted: false,
      ...createReportGuidance({
        errorCount: summary.errorCount,
        files,
        ruleSummaries,
        warningCount: summary.warningCount,
      }),
      errorCount: summary.errorCount,
      files,
      mode: "evaluate",
      omittedFileCount: filteredResults.omittedFileCount,
      preset,
      ruleSummaries,
      status,
      targetPath,
      typeConfig: typeConfig.typeConfig,
      warningCount: summary.warningCount,
    };

    return {
      ...output,
      configDeleted: true,
    } satisfies SkapxdLintOutput;
  });
  const hasConfigPath = configPath.length > 0;

  if (hasConfigPath) {
    removeFileIfExists(configPath);
  }

  for (const cleanupPath of cleanupPaths) {
    removeFileIfExists(cleanupPath);
  }

  if (!evaluationOutput.ok) {
    return Result.err({
      _tag: "CliExecutionError",
      cause: evaluationOutput.error,
      message: "No se pudo ejecutar ESLint con config efimera.",
    });
  }

  return Result.ok(evaluationOutput.value);
}
