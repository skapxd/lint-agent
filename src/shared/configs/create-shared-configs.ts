import { baseRules } from "./base-rules";
import { createTypedLanguageOptions } from "./create-typed-language-options";

export function createSharedConfigs(pluginReference: unknown) {
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
        "skapxd/jsx-return-name-pascal-case": "error",
        "skapxd/no-functions-inside-components": "error",
        "skapxd/no-jsx-ternary-null": "error",
        "skapxd/max-hook-size": [
          "warn",
          {
            maxLines: 120,
            maxUseState: 1,
          },
        ],
      },
    },
    // Capa de servicios del front (peticiones, clientes de API): todo await
    // debe ir envuelto en trySafe de @skapxd/result. El consumidor puede
    // sobreescribir `files` si sus servicios viven en otra carpeta.
    frontendServices: {
      files: ["**/services/**/*.{ts,tsx}", "**/api/**/*.{ts,tsx}"],
      languageOptions: typedLanguageOptions,
      name: "skapxd/shared/frontend-services",
      plugins: { skapxd: pluginReference },
      rules: {
        "skapxd/await-requires-try-safe": "error",
      },
    },
    package: {
      name: "skapxd/shared/package",
      plugins: { skapxd: pluginReference },
      rules: {
        "skapxd/one-root-function-per-file": "error",
      },
    },
  };
}
