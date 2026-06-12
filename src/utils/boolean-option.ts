import type { RuleOptions } from "#/utils/rule-types";

export function booleanOption(
  options: RuleOptions,
  key: string,
  fallback: boolean,
): boolean {
  const value = options[key];

  return typeof value === "boolean" ? value : fallback;
}
