import { getFilenameStem } from "./get-filename-stem";

export function isIndexFile(filename: string) {
  return getFilenameStem(filename) === "index";
}
