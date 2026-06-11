// @ts-nocheck
export function getStrictTsconfigOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // La regla se ancla a un entrypoint para reportar UNA vez por proyecto.
    anchorFilePatterns: options.anchorFilePatterns ?? [
      "src/main.ts",
      "src/main.tsx",
      "src/index.ts",
      "src/index.tsx",
    ],
    // Los flags que fuerzan a modelar estados en el tipo. `strict` NO los
    // implica: hay que pedirlos explícitos. exactOptionalPropertyTypes y
    // strictPropertyInitialization quedan fuera del default a propósito
    // (chocan con DTOs de class-transformer y con muchas librerías) — se
    // agregan por opción si el proyecto los soporta.
    requiredCompilerOptions: options.requiredCompilerOptions ?? [
      "strict",
      "noImplicitReturns",
      "noUncheckedIndexedAccess",
    ],
  };
}
