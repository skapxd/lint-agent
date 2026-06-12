export function matchesAnyPattern(value: string, patterns: readonly string[]) {
  return patterns.some((pattern) => new RegExp(pattern).test(value));
}
