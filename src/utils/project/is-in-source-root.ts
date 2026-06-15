import { getPathParts } from "./get-path-parts";

const SOURCE_ROOT_PARENT_OFFSET = -2;

export function isInSourceRoot(filename: string) {
  const pathParts = getPathParts(filename);
  return pathParts.at(SOURCE_ROOT_PARENT_OFFSET) === "src";
}
