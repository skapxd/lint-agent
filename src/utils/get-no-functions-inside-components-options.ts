import type { LegacyAstNode } from "#/utils/rule-types";
// Los callbacks inline de JSX y de .map son React idiomático: permitidos por
// defecto. El modo ultraestricto se activa pasando `false` explícito.
export function getNoFunctionsInsideComponentsOptions(options: LegacyAstNode = {}) {
  return {
    allowArrayMapCallbacks: options.allowArrayMapCallbacks ?? true,
    allowJsxCallbacks: options.allowJsxCallbacks ?? true,
  };
}
