import { createAdoptionRuleSummaries } from "./create-adoption-rule-summaries";
import { decodeAdoptionSeed } from "./decode-adoption-seed";
import { filterLintFilesByRuleIds } from "./filter-lint-files-by-rule-ids";
import { filterLintFilesExcludingRuleIds } from "./filter-lint-files-excluding-rule-ids";
import { summarizeLintResults } from "#/utils/cli/output/machine/summarize-lint-results";
import { createReportGuidance } from "#/utils/cli/output/report/create-report-guidance";
import type { SkapxdLintOutput } from "#/utils/cli/types";

export function createVerificationOutput(
  evaluationOutput: SkapxdLintOutput,
  seed: string,
) {
  const seedPayload = decodeAdoptionSeed(seed);
  const targetFiles = filterLintFilesByRuleIds(
    evaluationOutput.files,
    seedPayload.rules,
  );
  const outsideFiles = filterLintFilesExcludingRuleIds(
    evaluationOutput.files,
    seedPayload.rules,
  );
  const targetSummary = summarizeLintResults(targetFiles);
  const outsideSummary = summarizeLintResults(outsideFiles);
  const remainingRules = createAdoptionRuleSummaries(targetFiles);
  const remainingRuleIds = new Set(remainingRules.map((rule) => rule.ruleId));
  const fixedRules = seedPayload.rules.filter((rule) => !remainingRuleIds.has(rule));
  const completed =
    targetSummary.errorCount === 0 && targetSummary.warningCount === 0;
  const reportGuidance = createReportGuidance({
    errorCount: targetSummary.errorCount,
    files: targetFiles,
    ruleSummaries: remainingRules,
    seed,
    warningCount: targetSummary.warningCount,
  });

  return {
    ...evaluationOutput,
    ...reportGuidance,
    errorCount: targetSummary.errorCount,
    files: targetFiles,
    mode: "verify",
    resolutionPrompt: reportGuidance.resolutionPrompt,
    rulePlan: reportGuidance.rulePlan,
    status: completed ? "ok" : "findings",
    verification: {
      completed,
      fixedRuleCount: fixedRules.length,
      fixedRules,
      outsideViolationCount:
        outsideSummary.errorCount + outsideSummary.warningCount,
      remainingRuleCount: remainingRules.length,
      remainingRules,
      remainingViolationCount:
        targetSummary.errorCount + targetSummary.warningCount,
      seed,
      targetRules: seedPayload.rules,
    },
    warningCount: targetSummary.warningCount,
  } satisfies SkapxdLintOutput;
}
