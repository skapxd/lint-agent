import tseslint from "typescript-eslint";

export function createTypedLanguageOptions() {
  return {
    // Sin el parser explícito, un consumidor que use solo estos presets
    // obtiene "Parsing error" en cada archivo TS (espree no parsea TS).
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
    },
  };
}
