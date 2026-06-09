// @ts-nocheck
export function getDirectoryName(filename) {
  return filename.split(/[\\/]/).slice(0, -1).join("/");
}
