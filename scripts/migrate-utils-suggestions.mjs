import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    [
      "src/utils/get-awaited-operation-example.ts",
      "src/utils/suggestions/get-awaited-operation-example.ts",
    ],
    [
      "src/utils/get-call-expression-example.ts",
      "src/utils/suggestions/get-call-expression-example.ts",
    ],
    ["src/utils/get-move-suggestion.ts", "src/utils/suggestions/get-move-suggestion.ts"],
    [
      "src/utils/get-structure-suggestion.ts",
      "src/utils/suggestions/get-structure-suggestion.ts",
    ],
    [
      "src/utils/get-suggested-helper-file-name.ts",
      "src/utils/suggestions/get-suggested-helper-file-name.ts",
    ],
    [
      "src/utils/get-suggested-helper-file-names.ts",
      "src/utils/suggestions/get-suggested-helper-file-names.ts",
    ],
    [
      "src/utils/get-suggested-helper-path.ts",
      "src/utils/suggestions/get-suggested-helper-path.ts",
    ],
    ["src/utils/get-tree-child-lines.ts", "src/utils/suggestions/get-tree-child-lines.ts"],
    [
      "src/utils/get-try-safe-await-suggestion.ts",
      "src/utils/suggestions/get-try-safe-await-suggestion.ts",
    ],
  ],
});
