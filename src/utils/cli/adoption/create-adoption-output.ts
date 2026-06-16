import { createAdoptionRuleSummaries } from "./create-adoption-rule-summaries";
import { encodeAdoptionSeed } from "./encode-adoption-seed";
import { filterLintFilesByRuleIds } from "./filter-lint-files-by-rule-ids";
import { selectAdoptionRules } from "./select-adoption-rules";
import { summarizeLintResults } from "#/utils/cli/output/machine/summarize-lint-results";
import { createReportGuidance } from "#/utils/cli/output/report/create-report-guidance";
import type { SkapxdLintOutput } from "#/utils/cli/types";

export function createAdoptionOutput(
  evaluationOutput: SkapxdLintOutput,
  percent: number,
) {
  const ruleSummaries = createAdoptionRuleSummaries(evaluationOutput.files);
  const selection = selectAdoptionRules(ruleSummaries, percent);
  const selectedRuleIds = selection.selectedRules.map((rule) => rule.ruleId);
  const files = filterLintFilesByRuleIds(evaluationOutput.files, selectedRuleIds);
  const summary = summarizeLintResults(files);
  const seed = encodeAdoptionSeed(selection.selectedRules);
  const reportGuidance = createReportGuidance({
    errorCount: summary.errorCount,
    files,
    ruleSummaries: selection.selectedRules,
    seed,
    warningCount: summary.warningCount,
  });
  const status =
    summary.errorCount > 0 || summary.warningCount > 0 ? "findings" : "ok";

  return {
    ...evaluationOutput,
    adoption: {
      budget: selection.budget,
      percent,
      seed,
      selectedRuleCount: selection.selectedRules.length,
      selectedRules: selection.selectedRules,
      targetViolationCount: selection.selectedViolationCount,
      totalViolationCount: selection.totalViolationCount,
    },
    ...reportGuidance,
    errorCount: summary.errorCount,
    files,
    mode: "adopt",
    resolutionPrompt: reportGuidance.resolutionPrompt,
    rulePlan: reportGuidance.rulePlan,
    status,
    warningCount: summary.warningCount,
  } satisfies SkapxdLintOutput;
}
