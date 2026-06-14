import { isAdoptionTargetLintMessage } from "./is-adoption-target-lint-message";
import type { LintMessageResult } from "#/utils/cli/types";

export function getLintMessageRuleId(message: LintMessageResult) {
  return isAdoptionTargetLintMessage(message) ? message.ruleId : null;
}
