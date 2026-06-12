import type { LegacyAstNode } from "#/utils/rule-types";
export function getPreferAbortSignalOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    effectNames: options.effectNames ?? ["useEffect", "useLayoutEffect"],
  };
}
