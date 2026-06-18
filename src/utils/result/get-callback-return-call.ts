import type { TSESTree } from "@typescript-eslint/utils";
import { getCallFromExpression } from "./get-call-from-expression";
import type { CallbackFunctionNode } from "./no-rethrow-result-error-types";

export function getCallbackReturnCall(callback: CallbackFunctionNode) {
  const body = callback.body;
  const blockBody = body.type === "BlockStatement" ? body : null;
  if (!blockBody) {
    return getCallFromExpression(body);
  }

  const statements = blockBody.body.filter(
    (statement: TSESTree.Statement) => statement.type !== "EmptyStatement",
  );
  const onlyStatement = statements[0];
  const isSingleReturn = statements.length === 1 &&
    onlyStatement?.type === "ReturnStatement";
  if (!isSingleReturn) {
    return null;
  }

  return getCallFromExpression(onlyStatement.argument);
}
