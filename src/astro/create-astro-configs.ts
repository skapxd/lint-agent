import {
  baseRules,
  createBaseLanguageOptions,
  createTypedLanguageOptions,
  reactRules,
  typeDrivenRules,
  type OpinionatedConfigList,
  type OpinionatedPluginReference,
} from "#/shared/configs";

export function createAstroConfigs(
  pluginReference: OpinionatedPluginReference,
) {
  const baseLanguageOptions = createBaseLanguageOptions();
  const typedLanguageOptions = createTypedLanguageOptions();

  return [
    {
      files: ["src/**/*.{ts,tsx}"],
      languageOptions: baseLanguageOptions,
      name: "skapxd/astro/base",
      plugins: { skapxd: pluginReference },
      rules: baseRules,
    },
    // Los .astro no llevan parser propio: lo aporta eslint-plugin-astro,
    // que el consumidor debe tener configurado.
    {
      files: ["src/**/*.astro"],
      name: "skapxd/astro/astro-files",
      plugins: { skapxd: pluginReference },
      rules: baseRules,
    },
    {
      files: ["src/**/*.{ts,tsx}"],
      languageOptions: typedLanguageOptions,
      name: "skapxd/astro/typescript",
      plugins: { skapxd: pluginReference },
      rules: {
        ...typeDrivenRules,
        "skapxd/await-requires-result": "error",
      },
    },
    {
      files: ["src/**/*.tsx"],
      languageOptions: baseLanguageOptions,
      name: "skapxd/astro/react",
      plugins: { skapxd: pluginReference },
      rules: reactRules,
    },
  ] satisfies OpinionatedConfigList;
}
