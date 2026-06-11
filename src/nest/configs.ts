import { nestEntrypointFilePatterns } from "#/constants/nest-entrypoint-file-patterns";
import { baseRules, createTypedLanguageOptions } from "#/shared/configs";

export function createNestConfigs(pluginReference: unknown) {
  const typedLanguageOptions = createTypedLanguageOptions();

  return [
    // El dominio completo (services, controllers, modules, guards, ...).
    // Las carpetas fuera de src (dev/, scripts/, e2e/, integration-test/)
    // quedan fuera del preset a propósito: no son la app.
    {
      files: ["src/**/*.ts"],
      languageOptions: typedLanguageOptions,
      name: "skapxd/nest/base",
      plugins: { skapxd: pluginReference },
      rules: {
        ...baseRules,
        // Todo await resuelve en Result, salvo los entrypoints (main.ts,
        // instrumentation): ahí el bootstrap debe crashear ruidoso.
        "skapxd/await-requires-result": [
          "error",
          { allowFilePatterns: [...nestEntrypointFilePatterns] },
        ],
        // El controller es la frontera: consume el Result con match() y
        // traduce a DTO o HttpException. Devolverlo crudo serializa el
        // envelope { ok, error } al cliente.
        "skapxd/nest-no-result-response": "error",
      },
    },
    // Specs colocados: los tests awaitean helpers y SUTs libremente, y
    // descartar un Result en una aserción no es perder un trace.
    {
      files: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
      name: "skapxd/nest/tests",
      plugins: { skapxd: pluginReference },
      rules: {
        "skapxd/await-requires-result": "off",
        "skapxd/no-try-catch": "off",
        "skapxd/result-error-requires-handling": "off",
      },
    },
  ];
}
