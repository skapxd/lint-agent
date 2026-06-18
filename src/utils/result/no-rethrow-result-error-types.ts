import type { TSESTree } from "@typescript-eslint/utils";

export type NoRethrowResultErrorMessageId =
  | "rethrowDomainError"
  | "rethrowResultError"
  | "rethrowRuntimeError";

export type RawResultError = {
  errorExpression: TSESTree.Node;
  resultExpression: TSESTree.Node;
};

export type CallbackFunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;
