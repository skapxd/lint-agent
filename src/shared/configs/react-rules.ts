import type { Linter } from "eslint";

export const reactRules = {
  "skapxd/jsx-return-name-pascal-case": "error",
  "skapxd/no-functions-inside-components": "error",
  "skapxd/no-tunnel-props": "error",
  "skapxd/prefer-abort-signal": "error",
  "skapxd/no-jsx-ternary-null": "error",
  "skapxd/max-hook-size": [
    "error",
    {
      maxLines: 120,
      maxUseState: 1,
    },
  ],
  "skapxd/repeated-jsx-requires-component": "error",
} satisfies Linter.RulesRecord;
