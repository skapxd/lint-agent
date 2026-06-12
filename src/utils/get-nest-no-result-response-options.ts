import { stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getNestNoResultResponseOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    controllerDecoratorNames: stringArrayOption(options, "controllerDecoratorNames", ["Controller"]),
  };
}
