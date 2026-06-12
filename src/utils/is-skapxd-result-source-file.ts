import type { LegacyAstNode } from "#/utils/rule-types";
import { getPackageName } from "./get-package-name";

export function isSkapxdResultSourceFile(fileName: LegacyAstNode) {
  return getPackageName(fileName) === "@skapxd/result";
}
