// @ts-nocheck
// Archivos donde el ecosistema EXIGE `export default` y la regla
// no-default-export no debe reportar nunca: configs de tooling
// (next.config, tailwind.config, vitest.config, eslint.config, ...) y
// stories de Storybook (el meta es un default export por contrato CSF).
export const defaultExportAllowedFilePatterns = [
  "\\.config\\.(c|m)?[jt]s$",
  "\\.stories\\.[jt]sx?$",
];
