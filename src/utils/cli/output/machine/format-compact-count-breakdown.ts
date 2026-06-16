import type { CountBreakdownOutput } from "#/utils/cli/types";

export function formatCompactCountBreakdown(
  countBreakdown: CountBreakdownOutput | undefined,
) {
  if (countBreakdown === undefined) {
    return [];
  }

  return [
    "conteo:",
    `  totalErrorCount: ${countBreakdown.totalErrorCount}`,
    `  actionableErrorCount: ${countBreakdown.actionableErrorCount}`,
    `  skapxdRuleViolationCount: ${countBreakdown.skapxdRuleViolationCount}`,
    `  unattributedErrorCount: ${countBreakdown.unattributedErrorCount}`,
    `  warningCount: ${countBreakdown.warningCount}`,
    `  filesWithFindings: ${countBreakdown.filesWithFindings}`,
  ];
}
