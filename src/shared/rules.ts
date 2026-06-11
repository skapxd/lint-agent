import { oneRootFunctionPerFile } from "#/rules/one-root-function-per-file";
import { jsxReturnNamePascalCase } from "#/rules/jsx-return-name-pascal-case";
import { asyncFunctionsReturnResult } from "#/rules/async-functions-return-result";
import { noAdHocOkResult } from "#/rules/no-ad-hoc-ok-result";
import { awaitRequiresResult } from "#/rules/await-requires-result";
import { resultErrorRequiresCause } from "#/rules/result-error-requires-cause";
import { resultErrorRequiresHandling } from "#/rules/result-error-requires-handling";
import type { Rule } from "eslint";
import { maxHookSize } from "#/rules/max-hook-size";
import { nestNoResultResponse } from "#/rules/nest-no-result-response";
import { noDeepRelativeImports } from "#/rules/no-deep-relative-imports";
import { noDefaultExport } from "#/rules/no-default-export";
import { noEmoji } from "#/rules/no-emoji";
import { noTunnelProps } from "#/rules/no-tunnel-props";
import { noFunctionsInsideComponents } from "#/rules/no-functions-inside-components";
import { noTryCatch } from "#/rules/no-try-catch";
import { preferAbortSignal } from "#/rules/prefer-abort-signal";
import { preferTsPattern } from "#/rules/prefer-ts-pattern";
import { noJsxTernaryNull } from "#/rules/no-jsx-ternary-null";
import { noNestedIf } from "#/rules/no-nested-if";
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
  "result-error-requires-handling": resultErrorRequiresHandling,
  "max-hook-size": maxHookSize,
  "nest-no-result-response": nestNoResultResponse,
  "no-deep-relative-imports": noDeepRelativeImports,
  "no-default-export": noDefaultExport,
  "no-emoji": noEmoji,
  "no-tunnel-props": noTunnelProps,
  "no-functions-inside-components": noFunctionsInsideComponents,
  "no-try-catch": noTryCatch,
  "prefer-abort-signal": preferAbortSignal,
  "prefer-ts-pattern": preferTsPattern,
  "no-jsx-ternary-null": noJsxTernaryNull,
  "no-nested-if": noNestedIf,
  "no-promise-chain": noPromiseChain,
} as unknown as Record<string, Rule.RuleModule>;
