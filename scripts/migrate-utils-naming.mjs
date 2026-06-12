import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    ["src/utils/is-pascal-case-name.ts", "src/utils/naming/is-pascal-case-name.ts"],
    ["src/utils/to-kebab-case.ts", "src/utils/naming/to-kebab-case.ts"],
    ["src/utils/to-pascal-case.ts", "src/utils/naming/to-pascal-case.ts"],
  ],
});
