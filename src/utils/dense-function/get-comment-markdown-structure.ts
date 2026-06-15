import type { RuleComment } from "#/utils/rule-authoring/rule-types";

const CODE_FENCE_MARKER = "```";
const MARKDOWN_HEADER_PATTERN = /^#{1,6} /u;

export function getCommentMarkdownStructure(comment: RuleComment) {
  const cleanedText = comment.value
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/u, ""))
    .join("\n");
  const codeFenceCount = cleanedText.split(CODE_FENCE_MARKER).length - 1;
  const hasCodeFence = codeFenceCount >= 2;
  const hasHeader = cleanedText
    .split("\n")
    .some((line) => MARKDOWN_HEADER_PATTERN.test(line));

  return { hasCodeFence, hasHeader };
}
