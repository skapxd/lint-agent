import type { CountBreakdownOutput, LintFileResult } from "#/utils/cli/types";

const errorSeverity = 2;
const skapxdRulePrefix = "skapxd/";

type CreateCountBreakdownInput = {
  errorCount: number;
  files: LintFileResult[];
  warningCount: number;
};

export function createCountBreakdown({
  errorCount,
  files,
  warningCount,
}: CreateCountBreakdownInput) {
  let skapxdRuleViolationCount = 0;
  let unattributedErrorCount = 0;
  const filesWithFindings = files.filter((file) => file.messages.length > 0).length;

  for (const file of files) {
    for (const message of file.messages) {
      const isError = message.severity === errorSeverity;

      if (!isError) {
        continue;
      }

      const isSkapxdRule = message.ruleId?.startsWith(skapxdRulePrefix) === true;

      if (isSkapxdRule) {
        skapxdRuleViolationCount += 1;
        continue;
      }

      unattributedErrorCount += 1;
    }
  }

  return {
    actionableErrorCount: skapxdRuleViolationCount,
    filesWithFindings,
    skapxdRuleViolationCount,
    totalErrorCount: errorCount,
    unattributedErrorCount,
    warningCount,
  } satisfies CountBreakdownOutput;
}
