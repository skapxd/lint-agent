import { getPathParts } from "./get-path-parts";

export function isInsideAppDirectory(filename: string) {
  return getPathParts(filename).includes("app");
}
