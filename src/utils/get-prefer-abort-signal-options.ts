// @ts-nocheck
export function getPreferAbortSignalOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    effectNames: options.effectNames ?? ["useEffect", "useLayoutEffect"],
  };
}
