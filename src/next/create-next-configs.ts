import { nextAppMetadataFileStems } from "#/constants/next-app-metadata-file-stems";
import { nextAppRouteSegmentFileStems } from "#/constants/next-app-route-segment-file-stems";
import {
  baseRules,
  createBaseLanguageOptions,
  createTypedLanguageOptions,
  reactRules,
  type OpinionatedConfigList,
  type OpinionatedPluginReference,
} from "#/shared/configs";

// Entrypoints donde Next exige `export default` (page, layout, sitemap, ...):
// la regla no-default-export los exime automáticamente en este preset.
const nextDefaultExportFileGlob = `{${[
  ...nextAppRouteSegmentFileStems,
  ...nextAppMetadataFileStems,
].join(",")}}.{js,jsx,ts,tsx}`;

export function createNextConfigs(
  pluginReference: OpinionatedPluginReference,
) {
  const baseLanguageOptions = createBaseLanguageOptions();
  const typedLanguageOptions = createTypedLanguageOptions();

  return [
    {
      languageOptions: baseLanguageOptions,
      name: "skapxd/next/base",
      plugins: { skapxd: pluginReference },
      rules: {
        ...baseRules,
        "skapxd/no-default-export": [
          "error",
          {
            allowFilePatterns: [nextDefaultExportFileGlob],
          },
        ],
      },
    },
    {
      files: ["src/app/api/**/*.{ts,tsx}", "src/server/**/*.{ts,tsx}"],
      languageOptions: typedLanguageOptions,
      name: "skapxd/next/server",
      plugins: { skapxd: pluginReference },
      rules: {
        ...baseRules,
        // Obligatoria: todo await resuelve en Result. A diferencia de
        // async-functions-return-result (apagada por defecto), no necesita
        // excepciones para los entrypoints de Next: envolver un await en
        // trySafe es compatible con cualquier firma que imponga el framework.
        "skapxd/await-requires-result": "error",
      },
    },
    {
      files: ["**/*.tsx"],
      languageOptions: baseLanguageOptions,
      name: "skapxd/next/react",
      plugins: { skapxd: pluginReference },
      rules: reactRules,
    },
  ] satisfies OpinionatedConfigList;
}
