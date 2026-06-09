// @ts-nocheck
export function getFileName(filename) {
  return filename.split(/[\\/]/).at(-1) ?? filename;
}
