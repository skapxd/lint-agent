// @ts-nocheck
// Archivos donde el ecosistema EXIGE `export default` y la regla
// no-default-export no debe reportar nunca: configs de tooling
// (next.config, tailwind.config, vitest.config, eslint.config, ...) y
// stories de Storybook (el meta es un default export por contrato CSF).
// Son GLOBS, no regex: `*` = un segmento, `**` = cualquier profundidad.
export const defaultExportAllowedFilePatterns = [
  "*.config.*",
  "*.stories.*",
];
