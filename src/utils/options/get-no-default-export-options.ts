import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
import { defaultExportAllowedFilePatterns } from "#/constants/default-export-allowed-file-patterns";

// allowFilePatterns es ADITIVO: los patrones del consumidor se suman a los
// integrados. Así, cuando aparezca un framework o tool que la regla aún no
// contempla, basta con agregar su patrón sin perder los conocidos.
export function getNoDefaultExportOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: [
      ...defaultExportAllowedFilePatterns,
      ...(stringArrayOption(options, "allowFilePatterns", [])),
    ],
  };
}
