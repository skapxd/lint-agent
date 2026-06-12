import { numberOption, stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getNestInlineQueryOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Un @Query('name') suelto es legítimo; desde 2 ya es un DTO disfrazado.
    max: numberOption(options, "max", 1),
  };
}
