import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    ["src/utils/contains-await-expression.ts", "src/utils/async/contains-await-expression.ts"],
    ["src/utils/has-abort-signal-option.ts", "src/utils/async/has-abort-signal-option.ts"],
    [
      "src/utils/object-expression-has-signal.ts",
      "src/utils/async/object-expression-has-signal.ts",
    ],
  ],
});
