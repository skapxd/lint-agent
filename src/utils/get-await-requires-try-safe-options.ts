// @ts-nocheck
export function getAwaitRequiresTrySafeOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    trySafeCallNames: options.trySafeCallNames ?? ["trySafe"],
  };
}
