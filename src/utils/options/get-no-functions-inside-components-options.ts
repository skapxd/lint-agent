import { booleanOption } from "#/utils/options/boolean-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
// Los callbacks inline de JSX y de .map son React idiomático: permitidos por
// defecto. El modo ultraestricto se activa pasando `false` explícito.
export function getNoFunctionsInsideComponentsOptions(options: RuleOptions = {}) {
  return {
    allowArrayMapCallbacks: booleanOption(options, "allowArrayMapCallbacks", true),
    allowJsxCallbacks: booleanOption(options, "allowJsxCallbacks", true),
  };
}
