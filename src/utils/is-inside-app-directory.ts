// @ts-nocheck
import { getPathParts } from "./get-path-parts";

export function isInsideAppDirectory(filename) {
  return getPathParts(filename).includes("app");
}
