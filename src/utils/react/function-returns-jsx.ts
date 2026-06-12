import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { containsJsx } from "./contains-jsx";
import { containsOwnJsx } from "./contains-own-jsx";

export function functionReturnsJsx(functionNode: RuleNode) {
  const hasBlockBody = functionNode.body?.type === "BlockStatement";
  if (!hasBlockBody) {
    return containsJsx(functionNode.body);
  }

  return containsOwnJsx(functionNode.body);
}
