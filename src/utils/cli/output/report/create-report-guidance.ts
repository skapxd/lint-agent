import { createCountBreakdown } from "./create-count-breakdown";
import { createResolutionPrompt } from "./create-resolution-prompt";
import { createRulePlan } from "./create-rule-plan";
import { createUnattributedFindings } from "./create-unattributed-findings";
import type {
  AdoptionRuleSummary,
  LintFileResult,
  SkapxdLintOutput,
} from "#/utils/cli/types";

type CreateReportGuidanceInput = {
  errorCount: number;
  files: LintFileResult[];
  ruleSummaries: readonly AdoptionRuleSummary[];
  seed?: string | null;
  warningCount: number;
};

export function createReportGuidance({
  errorCount,
  files,
  ruleSummaries,
  seed = null,
  warningCount,
}: CreateReportGuidanceInput) {
  const rulePlan = createRulePlan(ruleSummaries);
  const hasRulePlan = rulePlan.length > 0;

  return {
    countBreakdown: createCountBreakdown({ errorCount, files, warningCount }),
    ...(hasRulePlan ? { resolutionPrompt: createResolutionPrompt({ seed }) } : {}),
    ...(hasRulePlan ? { rulePlan } : {}),
    unattributedFindings: createUnattributedFindings(files),
  } satisfies Pick<
    SkapxdLintOutput,
    "countBreakdown" | "resolutionPrompt" | "rulePlan" | "unattributedFindings"
  >;
}
