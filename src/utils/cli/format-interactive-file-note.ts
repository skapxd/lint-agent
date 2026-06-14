import path from "node:path";
import { formatInteractiveMessageLine } from "./format-interactive-message-line";
import type { LintFileResult } from "./types";

export function formatInteractiveFileNote(file: LintFileResult) {
  const relativePath = path.relative(process.cwd(), file.filePath);
  const messages = file.messages.map(formatInteractiveMessageLine).join("\n\n");

  return {
    messages,
    title: relativePath,
  };
}
