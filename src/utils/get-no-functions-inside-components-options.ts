// @ts-nocheck
export function getNoFunctionsInsideComponentsOptions(options = {}) {
  return {
    allowArrayMapCallbacks: options.allowArrayMapCallbacks ?? false,
    allowJsxCallbacks: options.allowJsxCallbacks ?? false,
  };
}
