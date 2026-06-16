import { getUnattributedFindingCategory } from "./get-unattributed-finding-category";
import type { LintFileResult, UnattributedFindingOutput } from "#/utils/cli/types";

const errorSeverity = 2;
const skapxdRulePrefix = "skapxd/";

export function createUnattributedFindings(files: LintFileResult[]) {
  const findings: UnattributedFindingOutput[] = [];

  for (const file of files) {
    for (const message of file.messages) {
      const isError = message.severity === errorSeverity;
      const isSkapxdRule = message.ruleId?.startsWith(skapxdRulePrefix) === true;
      const isUnattributedError = isError && !isSkapxdRule;

      if (!isUnattributedError) {
        continue;
      }

      findings.push({
        actionability: "cli-config-not-project-debt",
        category: getUnattributedFindingCategory(message),
        column: message.column,
        filePath: file.filePath,
        line: message.line,
        message: message.message,
        ruleId: message.ruleId,
      });
    }
  }

  return findings;
}
