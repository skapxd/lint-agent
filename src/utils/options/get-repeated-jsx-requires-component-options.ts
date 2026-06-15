import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

export type RepeatedJsxRequiresComponentOptions = {
  minClasses: number;
  minPatternNodes: number;
  minRepetitions: number;
};

const DEFAULT_MIN_CLASSES = 4;
const DEFAULT_MIN_REPETITIONS = 3;

export function getRepeatedJsxRequiresComponentOptions(
  rawOptions: RuleOptions | undefined,
): RepeatedJsxRequiresComponentOptions {
  const minClasses =
    typeof rawOptions?.minClasses === "number"
      ? rawOptions.minClasses
      : DEFAULT_MIN_CLASSES;
  const minPatternNodes =
    typeof rawOptions?.minPatternNodes === "number"
      ? rawOptions.minPatternNodes
      : 2;
  const minRepetitions =
    typeof rawOptions?.minRepetitions === "number"
      ? rawOptions.minRepetitions
      : DEFAULT_MIN_REPETITIONS;

  return {
    minClasses,
    minPatternNodes,
    minRepetitions,
  };
}
