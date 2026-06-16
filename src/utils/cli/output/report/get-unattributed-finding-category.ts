import { isRuleDefinitionMissingMessage } from "#/utils/cli/adoption/is-rule-definition-missing-message";
import type { LintMessageResult, UnattributedFindingCategory } from "#/utils/cli/types";

export function getUnattributedFindingCategory(message: LintMessageResult) {
  const isParseMessage = message.ruleId === null || message.ruleId === "parse";

  if (isParseMessage) {
    return "parse" satisfies UnattributedFindingCategory;
  }

  const isRuleDefinitionMissing = isRuleDefinitionMissingMessage(message);

  if (isRuleDefinitionMissing) {
    return "rule-definition-missing" satisfies UnattributedFindingCategory;
  }

  if (message.fatal === true) {
    return "fatal" satisfies UnattributedFindingCategory;
  }

  return "external-rule" satisfies UnattributedFindingCategory;
}
