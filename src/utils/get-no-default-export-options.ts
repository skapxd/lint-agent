// @ts-nocheck
import { defaultExportAllowedFilePatterns } from "#/constants/default-export-allowed-file-patterns";

// allowFilePatterns es ADITIVO: los patrones del consumidor se suman a los
// integrados. Así, cuando aparezca un framework o tool que la regla aún no
// contempla, basta con agregar su patrón sin perder los conocidos.
export function getNoDefaultExportOptions(options = {}) {
  return {
    allowFilePatterns: [
      ...defaultExportAllowedFilePatterns,
      ...(options.allowFilePatterns ?? []),
    ],
  };
}
