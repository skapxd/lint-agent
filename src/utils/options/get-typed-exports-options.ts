import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getTypedExportsOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Anclada al entrypoint de la libreria: un reporte por paquete.
    anchorFilePatterns: stringArrayOption(options, "anchorFilePatterns", [
      "src/index.ts",
      "src/index.tsx",
      "src/main.ts",
    ]),
  };
}
