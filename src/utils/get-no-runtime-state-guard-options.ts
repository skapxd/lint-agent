// @ts-nocheck
export function getNoRuntimeStateGuardOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
