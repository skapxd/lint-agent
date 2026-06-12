import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    [
      "src/utils/get-declared-alias-targets.ts",
      "src/utils/imports/get-declared-alias-targets.ts",
    ],
    ["src/utils/get-imported-local-names.ts", "src/utils/imports/get-imported-local-names.ts"],
    ["src/utils/get-internal-value-imports.ts", "src/utils/imports/get-internal-value-imports.ts"],
  ],
});
