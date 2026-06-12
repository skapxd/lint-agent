import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    [
      "src/utils/function-returns-skapxd-result-type.ts",
      "src/utils/result/function-returns-skapxd-result-type.ts",
    ],
    ["src/utils/get-enclosing-try-safe-call.ts", "src/utils/result/get-enclosing-try-safe-call.ts"],
    ["src/utils/get-error-member-object.ts", "src/utils/result/get-error-member-object.ts"],
    [
      "src/utils/get-failed-result-binary-guard-name.ts",
      "src/utils/result/get-failed-result-binary-guard-name.ts",
    ],
    ["src/utils/get-failed-result-guard.ts", "src/utils/result/get-failed-result-guard.ts"],
    ["src/utils/get-ok-member-object.ts", "src/utils/result/get-ok-member-object.ts"],
    ["src/utils/get-own-result-err-calls.ts", "src/utils/result/get-own-result-err-calls.ts"],
    ["src/utils/get-result-check-argument.ts", "src/utils/result/get-result-check-argument.ts"],
    ["src/utils/has-boolean-ok-property.ts", "src/utils/result/has-boolean-ok-property.ts"],
    [
      "src/utils/is-consumed-result-reference.ts",
      "src/utils/result/is-consumed-result-reference.ts",
    ],
    ["src/utils/is-failed-ok-comparison.ts", "src/utils/result/is-failed-ok-comparison.ts"],
    [
      "src/utils/is-inside-skapxd-result-returning-function.ts",
      "src/utils/result/is-inside-skapxd-result-returning-function.ts",
    ],
    ["src/utils/is-promise-of-result-type.ts", "src/utils/result/is-promise-of-result-type.ts"],
    ["src/utils/is-result-err-call.ts", "src/utils/result/is-result-err-call.ts"],
    ["src/utils/is-result-error-member.ts", "src/utils/result/is-result-error-member.ts"],
    ["src/utils/is-skapxd-named-type.ts", "src/utils/result/is-skapxd-named-type.ts"],
    [
      "src/utils/is-skapxd-result-err-call.ts",
      "src/utils/result/is-skapxd-result-err-call.ts",
    ],
    [
      "src/utils/is-skapxd-result-expression.ts",
      "src/utils/result/is-skapxd-result-expression.ts",
    ],
    [
      "src/utils/is-skapxd-result-or-promise-result-expression.ts",
      "src/utils/result/is-skapxd-result-or-promise-result-expression.ts",
    ],
    [
      "src/utils/is-skapxd-result-or-promise-result-type.ts",
      "src/utils/result/is-skapxd-result-or-promise-result-type.ts",
    ],
    [
      "src/utils/is-skapxd-result-source-file.ts",
      "src/utils/result/is-skapxd-result-source-file.ts",
    ],
    ["src/utils/is-skapxd-result-type.ts", "src/utils/result/is-skapxd-result-type.ts"],
    [
      "src/utils/is-symbol-from-skapxd-result.ts",
      "src/utils/result/is-symbol-from-skapxd-result.ts",
    ],
    ["src/utils/is-try-safe-call.ts", "src/utils/result/is-try-safe-call.ts"],
    ["src/utils/result-err-preserves-cause.ts", "src/utils/result/result-err-preserves-cause.ts"],
  ],
});
