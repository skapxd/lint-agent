import type { RuleOptions } from "#/utils/rule-types";

export function numberOption(
  options: RuleOptions,
  key: string,
  fallback: number,
): number {
  const value = options[key];

  return typeof value === "number" ? value : fallback;
}
