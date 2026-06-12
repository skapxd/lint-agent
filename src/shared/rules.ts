import { oneRootFunctionPerFile } from "#/rules/one-root-function-per-file";
import { jsxReturnNamePascalCase } from "#/rules/jsx-return-name-pascal-case";
import { asyncFunctionsReturnResult } from "#/rules/async-functions-return-result";
import { noAdHocOkResult } from "#/rules/no-ad-hoc-ok-result";
import { awaitRequiresResult } from "#/rules/await-requires-result";
import { resultErrorRequiresCause } from "#/rules/result-error-requires-cause";
import { resultErrorRequiresHandling } from "#/rules/result-error-requires-handling";
import { classPropertiesRequireReadonly } from "#/rules/class-properties-require-readonly";
import { noAccessors } from "#/rules/no-accessors";
import type { Rule } from "eslint";
import { maxHookSize } from "#/rules/max-hook-size";
import { maxPublicMethods } from "#/rules/max-public-methods";
import { nestDtoRequiresApiProperty } from "#/rules/nest-dto-requires-api-property";
import { nestDtoRequiresValidation } from "#/rules/nest-dto-requires-validation";
import { nestNoDirectInstantiation } from "#/rules/nest-no-direct-instantiation";
import { nestNoInlineQueryParams } from "#/rules/nest-no-inline-query-params";
import { nestNoResultResponse } from "#/rules/nest-no-result-response";
import { nestNoSwaggerInControllers } from "#/rules/nest-no-swagger-in-controllers";
import { nestRequiresSwaggerPlugin } from "#/rules/nest-requires-swagger-plugin";
import { nestValidationPipeConfig } from "#/rules/nest-validation-pipe-config";
import { noDeepRelativeImports } from "#/rules/no-deep-relative-imports";
import { noDefaultExport } from "#/rules/no-default-export";
import { noAnonymousCondition } from "#/rules/no-anonymous-condition";
import { noElse } from "#/rules/no-else";
import { noEmoji } from "#/rules/no-emoji";
import { noExplicitAny } from "#/rules/no-explicit-any";
import { noFloatingPromises } from "#/rules/no-floating-promises";
import { noUnsafeArgument } from "#/rules/no-unsafe-argument";
import { noUnsafeAssignment } from "#/rules/no-unsafe-assignment";
import { noUnsafeCall } from "#/rules/no-unsafe-call";
import { noUnsafeMemberAccess } from "#/rules/no-unsafe-member-access";
import { noUnsafeReturn } from "#/rules/no-unsafe-return";
import { noUnverifiedCast } from "#/rules/no-unverified-cast";
import { noImpossibleBranch } from "#/rules/no-impossible-branch";
import { noNonNullAssertion } from "#/rules/no-non-null-assertion";
import { noSilencedCompiler } from "#/rules/no-silenced-compiler";
import { noTunnelProps } from "#/rules/no-tunnel-props";
import { preferTypeOverInterface } from "#/rules/prefer-type-over-interface";
import { noFunctionsInsideComponents } from "#/rules/no-functions-inside-components";
import { noTryCatch } from "#/rules/no-try-catch";
import { preferAbortSignal } from "#/rules/prefer-abort-signal";
import { preferTaggedUnionState } from "#/rules/prefer-tagged-union-state";
import { requiresStrictTsconfig } from "#/rules/requires-strict-tsconfig";
import { preferTsPattern } from "#/rules/prefer-ts-pattern";
import { noJsxTernaryNull } from "#/rules/no-jsx-ternary-null";
import { noNestedIf } from "#/rules/no-nested-if";
import { noPromiseChain } from "#/rules/no-promise-chain";
import { noRuntimeStateGuard } from "#/rules/no-runtime-state-guard";
import { packageRequiresTypedExports } from "#/rules/package-requires-typed-exports";
import { untrustedModuleRequiresAdapter } from "#/rules/untrusted-module-requires-adapter";

export const rules: Record<string, Rule.RuleModule> = {
  "class-properties-require-readonly": classPropertiesRequireReadonly,
  "no-accessors": noAccessors,
  "one-root-function-per-file": oneRootFunctionPerFile,
  "jsx-return-name-pascal-case": jsxReturnNamePascalCase,
  "async-functions-return-result": asyncFunctionsReturnResult,
  "no-ad-hoc-ok-result": noAdHocOkResult,
  "await-requires-result": awaitRequiresResult,
  "result-error-requires-cause": resultErrorRequiresCause,
  "result-error-requires-handling": resultErrorRequiresHandling,
  "max-hook-size": maxHookSize,
  "max-public-methods": maxPublicMethods,
  "nest-dto-requires-api-property": nestDtoRequiresApiProperty,
  "nest-dto-requires-validation": nestDtoRequiresValidation,
  "nest-no-direct-instantiation": nestNoDirectInstantiation,
  "nest-no-inline-query-params": nestNoInlineQueryParams,
  "nest-no-result-response": nestNoResultResponse,
  "nest-no-swagger-in-controllers": nestNoSwaggerInControllers,
  "nest-requires-swagger-plugin": nestRequiresSwaggerPlugin,
  "nest-validation-pipe-config": nestValidationPipeConfig,
  "no-anonymous-condition": noAnonymousCondition,
  "no-deep-relative-imports": noDeepRelativeImports,
  "no-default-export": noDefaultExport,
  "no-else": noElse,
  "no-emoji": noEmoji,
  // Re-registros de reglas de typescript-eslint con nombre semántico y
  // mensajes propios (ver src/utils/wrap-tseslint-rule.ts):
  "no-explicit-any": noExplicitAny,
  "no-floating-promises": noFloatingPromises,
  "no-unsafe-argument": noUnsafeArgument,
  "no-unsafe-assignment": noUnsafeAssignment,
  "no-unsafe-call": noUnsafeCall,
  "no-unsafe-member-access": noUnsafeMemberAccess,
  "no-unsafe-return": noUnsafeReturn,
  "no-unverified-cast": noUnverifiedCast,
  "no-impossible-branch": noImpossibleBranch,
  "no-non-null-assertion": noNonNullAssertion,
  "no-silenced-compiler": noSilencedCompiler,
  "prefer-type-over-interface": preferTypeOverInterface,
  "no-tunnel-props": noTunnelProps,
  "no-functions-inside-components": noFunctionsInsideComponents,
  "no-try-catch": noTryCatch,
  "prefer-abort-signal": preferAbortSignal,
  "prefer-tagged-union-state": preferTaggedUnionState,
  "prefer-ts-pattern": preferTsPattern,
  "requires-strict-tsconfig": requiresStrictTsconfig,
  "no-jsx-ternary-null": noJsxTernaryNull,
  "no-nested-if": noNestedIf,
  "no-promise-chain": noPromiseChain,
  "no-runtime-state-guard": noRuntimeStateGuard,
  "package-requires-typed-exports": packageRequiresTypedExports,
  "untrusted-module-requires-adapter": untrustedModuleRequiresAdapter,
} as unknown as Record<string, Rule.RuleModule>;
