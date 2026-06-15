import type { Linter } from "eslint";

export const baseRules = {
  "skapxd/class-properties-require-readonly": "error",
  "skapxd/max-public-methods": "error",
  "skapxd/no-accessors": "error",
  "skapxd/no-ad-hoc-ok-result": "error",
  // En las bases por decisión del dueño (issue #2): con poca adopción
  // todavía, es el momento de subir la vara; los legacy la apagan en su
  // lista de pendientes (playbook de adopción del README).
  "skapxd/no-anonymous-condition": "error",
  "skapxd/no-deep-relative-imports": "error",
  "skapxd/no-default-export": "error",
  "skapxd/no-else": "error",
  "skapxd/no-emoji": "error",
  "skapxd/no-magic-numbers": [
    "error",
    {
      ignore: [-1, 0, 1, 2],
      ignoreArrayIndexes: true,
      ignoreEnums: true,
      ignoreReadonlyClassProperties: true,
      ignoreDefaultValues: true,
      enforceConst: true,
    },
  ],
  "skapxd/no-nested-if": "error",
  "skapxd/nested-function-requires-capture": "error",
  "skapxd/no-runtime-state-guard": "error",
  "skapxd/no-promise-chain": "error",
  "skapxd/no-try-catch": "error",
  "skapxd/one-root-function-per-file": "error",
  "skapxd/prefer-node-protocol-for-builtins": "error",
  "skapxd/prefer-tagged-union-state": "error",
  "skapxd/requires-strict-tsconfig": "error",
  "skapxd/prefer-ts-pattern": "error",
  "skapxd/result-error-requires-cause": "error",
  "skapxd/result-error-requires-handling": "error",
} satisfies Linter.RulesRecord;
