// @ts-nocheck
import { getPackageName } from "./get-package-name";

export function isSkapxdResultSourceFile(fileName) {
  return getPackageName(fileName) === "@skapxd/result";
}
