// @ts-nocheck
export function getAwaitRequiresResultOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    trySafeCallNames: options.trySafeCallNames ?? ["trySafe"],
  };
}
