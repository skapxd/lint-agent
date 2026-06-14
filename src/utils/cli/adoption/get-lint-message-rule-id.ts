import type { LintMessageResult } from "#/utils/cli/types";

export function getLintMessageRuleId(message: LintMessageResult) {
  return message.ruleId ?? "parse";
}
