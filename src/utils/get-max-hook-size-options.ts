import { numberOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getMaxHookSizeOptions(options: RuleOptions = {}) {
  return {
    maxLines: numberOption(options, "maxLines", 120),
    maxUseState: numberOption(options, "maxUseState", 1),
  };
}
