import { baseRules } from "./base-rules";
import { createBaseLanguageOptions } from "./create-base-language-options";
import { createTypedLanguageOptions } from "./create-typed-language-options";

export function createSharedConfigs(pluginReference: unknown) {
  const baseLanguageOptions = createBaseLanguageOptions();
  const typedLanguageOptions = createTypedLanguageOptions();

  return {
    backend: {
      languageOptions: typedLanguageOptions,
      name: "skapxd/shared/backend",
      plugins: { skapxd: pluginReference },
      rules: {
        ...baseRules,
        // La regla obligatoria del sistema de errores es await-requires-result
        // (todo await resuelve en Result). async-functions-return-result queda
        // apagada por defecto: exigir la firma por decreto choca con los bordes
        // del framework y bloquea la adopción incremental; la presión sobre los
        // awaits produce el mismo estado final. Ver "¿Por qué está apagada por
        // defecto?" en el README.
        "skapxd/await-requires-result": "error",
      },
    },
    base: {
      languageOptions: baseLanguageOptions,
      name: "skapxd/shared/base",
      plugins: { skapxd: pluginReference },
      rules: baseRules,
    },
    frontend: {
      languageOptions: typedLanguageOptions,
      name: "skapxd/shared/frontend",
      plugins: { skapxd: pluginReference },
      rules: {
        ...baseRules,
        // En el front no se obliga a retornar Result, pero todo await debe
        // resolver en uno: o la función llamada ya retorna Promise<Result>
        // (camino preferido: errores modelados en el dominio) o se envuelve
        // en trySafe en el sitio.
        "skapxd/await-requires-result": "error",
        "skapxd/jsx-return-name-pascal-case": "error",
        "skapxd/no-functions-inside-components": "error",
        "skapxd/no-jsx-ternary-null": "error",
        "skapxd/max-hook-size": [
          "error",
          {
            maxLines: 120,
            maxUseState: 1,
          },
        ],
      },
    },
    package: {
      languageOptions: baseLanguageOptions,
      name: "skapxd/shared/package",
      plugins: { skapxd: pluginReference },
      rules: {
        "skapxd/one-root-function-per-file": "error",
      },
    },
  };
}
