export function getPathParts(filename: string) {
  return filename.split(/[\\/]/).filter(Boolean);
}
