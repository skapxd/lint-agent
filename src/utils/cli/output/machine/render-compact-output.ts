import { formatCompactAdoptionSummary } from "./format-compact-adoption-summary";
import { formatCompactMessage } from "./format-compact-message";
import { formatCompactPath } from "./format-compact-path";
import { formatCompactStateSummary } from "./format-compact-state-summary";
import { formatCompactSummary } from "./format-compact-summary";
import { formatCompactTypeConfig } from "./format-compact-type-config";
import { formatCompactVerificationSummary } from "./format-compact-verification-summary";
import type { SkapxdLintOutput } from "#/utils/cli/types";

export function renderCompactOutput(output: SkapxdLintOutput) {
  const lines = [formatCompactSummary(output)];
  const adoptionSummary = formatCompactAdoptionSummary(output);
  const stateSummary = formatCompactStateSummary(output);
  const typeConfigSummary = formatCompactTypeConfig(output.typeConfig);
  const verificationSummary = formatCompactVerificationSummary(output);
  const hasAdoptionSummary = adoptionSummary.length > 0;
  const hasStateSummary = stateSummary.length > 0;
  const hasVerificationSummary = verificationSummary.length > 0;
  const filesWithFindings = output.files.filter((file) => file.messages.length > 0);

  if (typeConfigSummary) {
    lines.push(typeConfigSummary);
  }

  if (hasAdoptionSummary) {
    lines.push("");
    lines.push(...adoptionSummary);
  }

  if (hasStateSummary) {
    lines.push("");
    lines.push(...stateSummary);
  }

  if (hasVerificationSummary) {
    lines.push("");
    lines.push(...verificationSummary);
  }

  for (const file of filesWithFindings) {
    const relativeFilePath = formatCompactPath(file.filePath, output.targetPath ?? null);

    lines.push("");
    lines.push(relativeFilePath);

    for (const message of file.messages) {
      const ruleId = message.ruleId ?? "parse";
      const location = `${message.line}:${message.column}`;
      const text = formatCompactMessage(message.message);

      lines.push(`  ${location}  ${ruleId}  ${text}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
