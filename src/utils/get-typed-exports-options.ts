import type { LegacyAstNode } from "#/utils/rule-types";
export function getTypedExportsOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Anclada al entrypoint de la libreria: un reporte por paquete.
    anchorFilePatterns: options.anchorFilePatterns ?? [
      "src/index.ts",
      "src/index.tsx",
      "src/main.ts",
    ],
  };
}
