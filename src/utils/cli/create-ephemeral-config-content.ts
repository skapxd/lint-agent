import type { CliPreset } from "./types";

export function createEphemeralConfigContent(
  packageEntryUrl: string,
  preset: CliPreset,
) {
  return `import plugin from ${JSON.stringify(packageEntryUrl)};

const selected = plugin.configs[${JSON.stringify(preset)}];
const configs = Array.isArray(selected) ? selected : [selected];
const lintableFiles = ["**/*.{js,cjs,mjs,ts,cts,mts,jsx,tsx}"];
const configsWithFiles = configs.map((config) =>
  config.files ? config : { ...config, files: lintableFiles },
);

export default [
  {
    ignores: [
      "**/.tmp-skapxd-lint-*.config.mjs",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
    ],
  },
  ...configsWithFiles,
];
`;
}
