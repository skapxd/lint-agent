import type { RuleNode } from "#/utils/rule-types";
import { getPackageName } from "./get-package-name";

export function isSkapxdResultSourceFile(fileName: string) {
  return getPackageName(fileName) === "@skapxd/result";
}
