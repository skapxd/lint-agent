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
        "skapxd/async-functions-return-result": [
          "error",
          {
            checkMissingReturnType: true,
            resultTypeNames: ["Result", "ResultValue", "SafeResult"],
          },
        ],
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
        // En el front no se obliga a retornar Result, pero toda llamada
        // asíncrona debe ir en trySafe — salvo que lo awaiteado ya retorne
        // Result/Promise<Result> (exención type-aware de la regla).
        "skapxd/await-requires-try-safe": "error",
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
