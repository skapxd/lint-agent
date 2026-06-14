import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

export type RepeatedJsxRequiresComponentOptions = {
  minClasses: number;
  minPatternNodes: number;
  minRepetitions: number;
};

export function getRepeatedJsxRequiresComponentOptions(
  rawOptions: RuleOptions | undefined,
): RepeatedJsxRequiresComponentOptions {
  const minClasses =
    typeof rawOptions?.minClasses === "number" ? rawOptions.minClasses : 4;
  const minPatternNodes =
    typeof rawOptions?.minPatternNodes === "number"
      ? rawOptions.minPatternNodes
      : 2;
  const minRepetitions =
    typeof rawOptions?.minRepetitions === "number"
      ? rawOptions.minRepetitions
      : 3;

  return {
    minClasses,
    minPatternNodes,
    minRepetitions,
  };
}
