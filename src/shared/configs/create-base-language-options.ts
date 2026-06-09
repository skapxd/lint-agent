import tseslint from "typescript-eslint";

// Variante sin type-checking: solo el parser, para presets que aplican a TS
// pero no necesitan projectService (base, package, next/base, next/react).
export function createBaseLanguageOptions() {
  return {
    parser: tseslint.parser,
  };
}
