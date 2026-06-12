import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    ["src/utils/contains-jsx.ts", "src/utils/react/contains-jsx.ts"],
    ["src/utils/contains-own-jsx.ts", "src/utils/react/contains-own-jsx.ts"],
    [
      "src/utils/count-own-use-state-calls-in-node.ts",
      "src/utils/react/count-own-use-state-calls-in-node.ts",
    ],
    [
      "src/utils/count-own-use-state-calls.ts",
      "src/utils/react/count-own-use-state-calls.ts",
    ],
    ["src/utils/function-returns-jsx.ts", "src/utils/react/function-returns-jsx.ts"],
    ["src/utils/get-state-shape-smell.ts", "src/utils/react/get-state-shape-smell.ts"],
    [
      "src/utils/get-use-state-setter-name.ts",
      "src/utils/react/get-use-state-setter-name.ts",
    ],
    [
      "src/utils/get-use-state-variable-name.ts",
      "src/utils/react/get-use-state-variable-name.ts",
    ],
    ["src/utils/is-array-map-callback.ts", "src/utils/react/is-array-map-callback.ts"],
    [
      "src/utils/is-expression-arrow-function.ts",
      "src/utils/react/is-expression-arrow-function.ts",
    ],
    [
      "src/utils/is-forwarded-prop-reference.ts",
      "src/utils/react/is-forwarded-prop-reference.ts",
    ],
    ["src/utils/is-hook-name.ts", "src/utils/react/is-hook-name.ts"],
    [
      "src/utils/is-inside-effect-callback.ts",
      "src/utils/react/is-inside-effect-callback.ts",
    ],
    [
      "src/utils/is-jsx-attribute-callback.ts",
      "src/utils/react/is-jsx-attribute-callback.ts",
    ],
    [
      "src/utils/is-pascal-case-jsx-element.ts",
      "src/utils/react/is-pascal-case-jsx-element.ts",
    ],
  ],
});
