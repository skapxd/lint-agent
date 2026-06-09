// @ts-nocheck
import { containsJsx } from "./contains-jsx";
import { containsOwnJsx } from "./contains-own-jsx";

export function functionReturnsJsx(functionNode) {
  if (functionNode.body?.type !== "BlockStatement") {
    return containsJsx(functionNode.body);
  }

  return containsOwnJsx(functionNode.body);
}
