import { numberOption } from "#/utils/options/number-option";
import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getNestInlineQueryOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Un @Query('name') suelto es legítimo; desde 2 ya es un DTO disfrazado.
    max: numberOption(options, "max", 1),
  };
}
