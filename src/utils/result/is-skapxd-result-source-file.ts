import { getPackageName } from "#/utils/project/get-package-name";

export function isSkapxdResultSourceFile(fileName: string) {
  return getPackageName(fileName) === "@skapxd/result";
}
