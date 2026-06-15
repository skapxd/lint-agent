import { basename, extname } from "node:path";

export function getFilenameStem(filename: string) {
  const fileBasename = basename(filename);

  return fileBasename.slice(0, fileBasename.length - extname(fileBasename).length);
}
