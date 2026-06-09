// @ts-nocheck
import { getPathParts } from "./get-path-parts";

export function isInSourceRoot(filename) {
  const pathParts = getPathParts(filename);
  return pathParts.at(-2) === "src";
}
