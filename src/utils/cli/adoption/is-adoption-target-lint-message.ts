import { isRuleDefinitionMissingMessage } from "./is-rule-definition-missing-message";
import type { LintMessageResult } from "#/utils/cli/types";

export function isAdoptionTargetLintMessage(message: LintMessageResult) {
  return (
    message.fatal !== true &&
    message.ruleId !== null &&
    !isRuleDefinitionMissingMessage(message)
  );
}
