import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getPackageName } from "#/utils/project/get-package-name";

export function isSkapxdResultSourceFile(fileName: string) {
  return getPackageName(fileName) === "@skapxd/result";
}
