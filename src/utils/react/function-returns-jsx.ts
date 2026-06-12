import type { FunctionNode } from "#/utils/ast/is-function-node";
import { containsJsx } from "./contains-jsx";
import { containsOwnJsx } from "./contains-own-jsx";

export function functionReturnsJsx(functionNode: FunctionNode) {
  const hasBlockBody = functionNode.body.type === "BlockStatement";
  if (!hasBlockBody) {
    return containsJsx(functionNode.body);
  }

  return containsOwnJsx(functionNode.body);
}
