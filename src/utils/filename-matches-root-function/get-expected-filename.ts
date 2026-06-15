import { extname } from "node:path";
import { toKebabCase } from "#/utils/naming/to-kebab-case";

export function getExpectedFilename(filename: string, exportName: string) {
  return `${toKebabCase(exportName)}${extname(filename)}`;
}
