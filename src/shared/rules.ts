import { oneRootFunctionPerFile } from "#/rules/one-root-function-per-file";
import { jsxReturnNamePascalCase } from "#/rules/jsx-return-name-pascal-case";
import { asyncFunctionsReturnResult } from "#/rules/async-functions-return-result";
import { noAdHocOkResult } from "#/rules/no-ad-hoc-ok-result";
import { awaitRequiresResult } from "#/rules/await-requires-result";
import { resultErrorRequiresCause } from "#/rules/result-error-requires-cause";
import type { Rule } from "eslint";
import { maxHookSize } from "#/rules/max-hook-size";
import { noDeepRelativeImports } from "#/rules/no-deep-relative-imports";
import { noDefaultExport } from "#/rules/no-default-export";
import { noEmoji } from "#/rules/no-emoji";
import { noFunctionsInsideComponents } from "#/rules/no-functions-inside-components";
import { noTryCatch } from "#/rules/no-try-catch";
import { preferTsPattern } from "#/rules/prefer-ts-pattern";
import { noJsxTernaryNull } from "#/rules/no-jsx-ternary-null";
import { noPromiseChain } from "#/rules/no-promise-chain";

export const rules: Record<string, Rule.RuleModule> = {
  "one-root-function-per-file": oneRootFunctionPerFile,
  "jsx-return-name-pascal-case": jsxReturnNamePascalCase,
  "async-functions-return-result": asyncFunctionsReturnResult,
  "no-ad-hoc-ok-result": noAdHocOkResult,
  "await-requires-result": awaitRequiresResult,
  // Alias deprecado del nombre anterior; se elimina en una versión futura.
  "await-requires-try-safe": {
    ...awaitRequiresResult,
    meta: {
      ...awaitRequiresResult.meta,
      deprecated: true,
      replacedBy: ["skapxd/await-requires-result"],
    },
  },
  "result-error-requires-cause": resultErrorRequiresCause,
  "max-hook-size": maxHookSize,
  "no-deep-relative-imports": noDeepRelativeImports,
  "no-default-export": noDefaultExport,
  "no-emoji": noEmoji,
  "no-functions-inside-components": noFunctionsInsideComponents,
  "no-try-catch": noTryCatch,
  "prefer-ts-pattern": preferTsPattern,
  "no-jsx-ternary-null": noJsxTernaryNull,
  "no-promise-chain": noPromiseChain,
} as unknown as Record<string, Rule.RuleModule>;
