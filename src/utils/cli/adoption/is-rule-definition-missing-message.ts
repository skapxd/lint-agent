import type { LintMessageResult } from "#/utils/cli/types";

export function isRuleDefinitionMissingMessage(message: LintMessageResult) {
  return /^Definition for rule '.+' was not found\.$/u.test(message.message);
}
