import { baseRules, createTypedLanguageOptions } from "#/shared/configs";

export function createAstroConfigs(pluginReference: unknown) {
  const typedLanguageOptions = createTypedLanguageOptions();

  return [
    {
      files: ["src/**/*.{ts,tsx,astro}"],
      name: "skapxd/astro/base",
      plugins: { skapxd: pluginReference },
      rules: baseRules,
    },
    {
      files: ["src/**/*.{ts,tsx}"],
      languageOptions: typedLanguageOptions,
      name: "skapxd/astro/typescript",
      plugins: { skapxd: pluginReference },
      rules: {
        "skapxd/result-error-requires-cause": "error",
      },
    },
  ];
}
