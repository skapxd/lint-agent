export function getDirectoryName(filename: string) {
  return filename.split(/[\\/]/).slice(0, -1).join("/");
}
