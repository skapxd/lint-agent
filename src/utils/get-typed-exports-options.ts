// @ts-nocheck
export function getTypedExportsOptions(options = {}) {
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
