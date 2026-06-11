// @ts-nocheck
export function getResultErrorRequiresHandlingOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
