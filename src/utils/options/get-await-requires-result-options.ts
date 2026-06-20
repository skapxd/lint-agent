import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getAwaitRequiresResultOptions(options: RuleOptions = {}) {
  const useCaseDecoratorSource = typeof options.useCaseDecoratorSource === "string"
    ? options.useCaseDecoratorSource
    : "@skapxd/nest";

  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    trySafeCallNames: stringArrayOption(options, "trySafeCallNames", ["trySafe"]),
    useCaseDecoratorNames: stringArrayOption(options, "useCaseDecoratorNames", ["UseCase"]),
    useCaseDecoratorSource,
  };
}
