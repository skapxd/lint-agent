import { numberOption } from "#/utils/options/number-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getMaxHookSizeOptions(options: RuleOptions = {}) {
  return {
    maxLines: numberOption(options, "maxLines", 120),
    maxUseState: numberOption(options, "maxUseState", 1),
  };
}
