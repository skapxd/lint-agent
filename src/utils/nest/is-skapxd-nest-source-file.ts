import { getPackageName } from "#/utils/project/get-package-name";

export function isSkapxdNestSourceFile(fileName: string, packageName: string) {
  return getPackageName(fileName) === packageName;
}
