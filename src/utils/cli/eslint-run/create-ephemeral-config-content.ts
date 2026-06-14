import type { CliPreset } from "#/utils/cli/types";

export function createEphemeralConfigContent(
  packageEntryUrl: string,
  preset: CliPreset,
  includeTests: boolean,
) {
  const testIgnorePatterns = includeTests
    ? []
    : [
        "**/*.{test,spec}.{js,jsx,cjs,mjs,ts,tsx,cts,mts}",
        "**/__tests__/**",
        "**/test/**",
        "**/tests/**",
      ];
  const ignorePatterns = [
    "**/.tmp-skapxd-lint-*.config.mjs",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/*.config.{js,cjs,mjs,ts,cts,mts}",
    "**/fixtures/**",
    "**/__fixtures__/**",
    "**/__mocks__/**",
    ...testIgnorePatterns,
  ];

  return `import plugin from ${JSON.stringify(packageEntryUrl)};

const selected = plugin.configs[${JSON.stringify(preset)}];
const configs = Array.isArray(selected) ? selected : [selected];
const lintableFiles = ["**/*.{js,cjs,mjs,ts,cts,mts,jsx,tsx}"];
const configsWithFiles = configs.map((config) =>
  config.files ? config : { ...config, files: lintableFiles },
);

export default [
  {
    ignores: ${JSON.stringify(ignorePatterns, null, 6)},
  },
  ...configsWithFiles,
];
`;
}
