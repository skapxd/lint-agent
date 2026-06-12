import { getPathParts } from "./get-path-parts";

export function isInSourceRoot(filename: string) {
  const pathParts = getPathParts(filename);
  return pathParts.at(-2) === "src";
}
