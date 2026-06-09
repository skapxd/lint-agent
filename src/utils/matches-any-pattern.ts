// @ts-nocheck
export function matchesAnyPattern(value, patterns) {
  return patterns.some((pattern) => new RegExp(pattern).test(value));
}
