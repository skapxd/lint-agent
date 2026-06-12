import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    ["src/utils/call-has-type-predicate.ts", "src/utils/type-aware/call-has-type-predicate.ts"],
    ["src/utils/get-function-return-type.ts", "src/utils/type-aware/get-function-return-type.ts"],
    ["src/utils/get-type-context.ts", "src/utils/type-aware/get-type-context.ts"],
    [
      "src/utils/get-type-reference-parameters.ts",
      "src/utils/type-aware/get-type-reference-parameters.ts",
    ],
    ["src/utils/is-promise-type.ts", "src/utils/type-aware/is-promise-type.ts"],
    ["src/utils/is-type-reference-named.ts", "src/utils/type-aware/is-type-reference-named.ts"],
    ["src/utils/resolve-alias-symbol.ts", "src/utils/type-aware/resolve-alias-symbol.ts"],
  ],
});
