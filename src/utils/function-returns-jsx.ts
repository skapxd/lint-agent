import type { RuleNode } from "#/utils/rule-types";
import { containsJsx } from "./contains-jsx";
import { containsOwnJsx } from "./contains-own-jsx";

export function functionReturnsJsx(functionNode: RuleNode) {
  if (functionNode.body?.type !== "BlockStatement") {
    return containsJsx(functionNode.body);
  }

  return containsOwnJsx(functionNode.body);
}
