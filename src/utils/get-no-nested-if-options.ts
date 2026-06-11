// @ts-nocheck
export function getNoNestedIfOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
