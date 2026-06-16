import { formatCompactMessage } from "./format-compact-message";
import { formatCompactPath } from "./format-compact-path";
import type { UnattributedFindingOutput } from "#/utils/cli/types";

type FormatCompactUnattributedFindingsInput = {
  findings: readonly UnattributedFindingOutput[] | undefined;
  targetPath: string | undefined;
};

export function formatCompactUnattributedFindings({
  findings,
  targetPath,
}: FormatCompactUnattributedFindingsInput) {
  const hasFindings = findings !== undefined && findings.length > 0;

  if (!hasFindings) {
    return [];
  }

  return [
    "no atribuidos:",
    ...findings.map((finding) => {
      const relativeFilePath = formatCompactPath(
        finding.filePath,
        targetPath ?? null,
      );
      const ruleId = finding.ruleId ?? "parse";
      const message = formatCompactMessage(finding.message);

      return `  ${relativeFilePath}:${finding.line}:${finding.column}  ${finding.category}  ${ruleId}  ${message}  ${finding.actionability}`;
    }),
  ];
}
