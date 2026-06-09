// @ts-nocheck
export function getPathParts(filename) {
  return filename.split(/[\\/]/).filter(Boolean);
}
