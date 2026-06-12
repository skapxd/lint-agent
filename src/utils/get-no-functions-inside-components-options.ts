import { booleanOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
// Los callbacks inline de JSX y de .map son React idiomático: permitidos por
// defecto. El modo ultraestricto se activa pasando `false` explícito.
export function getNoFunctionsInsideComponentsOptions(options: RuleOptions = {}) {
  return {
    allowArrayMapCallbacks: booleanOption(options, "allowArrayMapCallbacks", true),
    allowJsxCallbacks: booleanOption(options, "allowJsxCallbacks", true),
  };
}
