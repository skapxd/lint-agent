export function getFileName(filename: string) {
  return filename.split(/[\\/]/).at(-1) ?? filename;
}
