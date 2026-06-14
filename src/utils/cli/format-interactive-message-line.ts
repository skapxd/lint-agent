import pc from "picocolors";
import { getSeverityLabel } from "./get-severity-label";
import type { LintMessageResult } from "./types";

export function formatInteractiveMessageLine(message: LintMessageResult) {
  const location = pc.dim(`${message.line}:${message.column}`);
  const rule = pc.cyan(message.ruleId ?? "eslint");
  const severity = getSeverityLabel(message.severity);

  return `${location} ${severity} ${rule}\n${message.message}`;
}
