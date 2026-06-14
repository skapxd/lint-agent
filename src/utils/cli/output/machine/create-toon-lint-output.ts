import path from "node:path";
import type { SkapxdLintOutput } from "#/utils/cli/types";

type ToonLintMessage = {
  id: string;
  ruleId: string;
  message: string;
};

type ToonLintFinding = {
  file: string;
  line: number;
  column: number;
  severity: number;
  messageId: string;
};

export function createToonLintOutput(output: SkapxdLintOutput) {
  const messagesByKey = new Map<string, string>();
  const messages: ToonLintMessage[] = [];
  const findings: ToonLintFinding[] = [];
  const rootPath = output.targetPath ?? "";

  for (const file of output.files) {
    for (const message of file.messages) {
      const ruleId = message.ruleId ?? "parse";
      const messageKey = `${ruleId}\u0000${message.message}`;
      const existingMessageId = messagesByKey.get(messageKey);
      const messageId = existingMessageId ?? `m${messages.length + 1}`;
      const needsMessageRegistration = existingMessageId === undefined;
      const hasRootPath = rootPath.length > 0;
      const filePathIsAbsolute = path.isAbsolute(file.filePath);
      const shouldUseRelativePath = hasRootPath && filePathIsAbsolute;

      if (needsMessageRegistration) {
        messagesByKey.set(messageKey, messageId);
        messages.push({ id: messageId, ruleId, message: message.message });
      }

      findings.push({
        file: shouldUseRelativePath
          ? path.relative(rootPath, file.filePath)
          : file.filePath,
        line: message.line,
        column: message.column,
        severity: message.severity,
        messageId,
      });
    }
  }

  return {
    v: 1,
    status: output.status,
    mode: output.mode,
    preset: output.preset ?? null,
    targetPath: output.targetPath ?? null,
    configDeleted: output.configDeleted ?? null,
    changedFiles: output.changedFiles ?? [],
    errors: output.errorCount,
    warnings: output.warningCount,
    files: new Set(findings.map((finding) => finding.file)).size,
    findingCount: findings.length,
    messages,
    findings,
  };
}
