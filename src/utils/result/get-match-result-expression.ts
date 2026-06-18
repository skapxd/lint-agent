import type { TSESTree } from "@typescript-eslint/utils";
import { getMatchArgument } from "./get-match-argument";
import { isFailedOkObjectPattern } from "./is-failed-ok-object-pattern";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import type { CallbackFunctionNode } from "./no-rethrow-result-error-types";

export function getMatchResultExpression(callback: CallbackFunctionNode) {
  const parent = callback.parent;
  const isCallExpressionParent = parent.type === "CallExpression";
  if (!isCallExpressionParent) {
    return null;
  }

  const callee = parent.callee;
  const hasCallbackArgument = parent.arguments.includes(callback);
  const hasWithCallee = callee.type === "MemberExpression" &&
    isMemberPropertyNamed(callee, "with");
  const hasFailedPattern = isFailedOkObjectPattern(parent.arguments[0]);
  const isFailedWithCallback = hasCallbackArgument &&
    hasWithCallee &&
    hasFailedPattern;
  if (!isFailedWithCallback) {
    return null;
  }

  return getMatchArgument(callee.object);
}
