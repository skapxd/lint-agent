import { baseRules, createTypedLanguageOptions } from "#/shared/configs";

export function createNextConfigs(pluginReference: unknown) {
  const typedLanguageOptions = createTypedLanguageOptions();

  return [
    {
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
      name: "skapxd/next/react",
      plugins: { skapxd: pluginReference },
      rules: {
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
  ];
}
