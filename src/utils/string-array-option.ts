import type { RuleOptions } from "#/utils/rule-types";

export function stringArrayOption(
  options: RuleOptions,
  key: string,
  fallback: string[] = [],
): string[] {
  const value = options[key];

  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}
