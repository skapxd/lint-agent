import {
  baseRules,
  createBaseLanguageOptions,
  createTypedLanguageOptions,
} from "#/shared/configs";

export function createNextConfigs(pluginReference: unknown) {
  const baseLanguageOptions = createBaseLanguageOptions();
  const typedLanguageOptions = createTypedLanguageOptions();

  return [
    {
      languageOptions: baseLanguageOptions,
      name: "skapxd/next/base",
      plugins: { skapxd: pluginReference },
      rules: baseRules,
    },
    {
      files: ["src/app/api/**/*.{ts,tsx}", "src/server/**/*.{ts,tsx}"],
      languageOptions: typedLanguageOptions,
      name: "skapxd/next/server",
      plugins: { skapxd: pluginReference },
      rules: {
        ...baseRules,
        "skapxd/async-functions-return-result": [
          "error",
          {
            allowFilePatterns: [
              "/(route|page|layout|template|loading|error|not-found)\\.tsx?$",
            ],
            allowNamePatterns: [
              "^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$",
              "^handle(Get|Post|Put|Patch|Delete|Head|Options)$",
              "^start$",
            ],
            checkMissingReturnType: true,
            resultTypeNames: ["Result", "ResultValue", "SafeResult"],
          },
        ],
      },
    },
    {
      files: ["**/*.tsx"],
      languageOptions: baseLanguageOptions,
      name: "skapxd/next/react",
      plugins: { skapxd: pluginReference },
      rules: {
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
  ];
}
