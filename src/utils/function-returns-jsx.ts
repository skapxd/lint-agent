import type { LegacyAstNode } from "#/utils/rule-types";
import { containsJsx } from "./contains-jsx";
import { containsOwnJsx } from "./contains-own-jsx";

export function functionReturnsJsx(functionNode: LegacyAstNode) {
  if (functionNode.body?.type !== "BlockStatement") {
    return containsJsx(functionNode.body);
  }

  return containsOwnJsx(functionNode.body);
}
