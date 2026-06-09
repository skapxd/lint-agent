// @ts-nocheck
export function getMaxHookSizeOptions(options = {}) {
  return {
    maxLines: options.maxLines ?? 120,
    maxUseState: options.maxUseState ?? 1,
  };
}
