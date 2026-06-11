// @ts-nocheck
export function getNoAccessorsOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
