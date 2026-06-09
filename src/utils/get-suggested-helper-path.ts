// @ts-nocheck
import { getDirectoryName } from "./get-directory-name";
import { getSuggestedHelperFileName } from "./get-suggested-helper-file-name";
import { isNextConventionFile } from "./is-next-convention-file";
import { toKebabCase } from "./to-kebab-case";

export function getSuggestedHelperPath({ extension, fileStem, filename, functionName }) {
  const helperFileName = getSuggestedHelperFileName({
    extension,
    fileStem,
    functionName,
  });

  if (isNextConventionFile({ fileStem, filename })) {
    return `${getDirectoryName(filename)}/${helperFileName}`;
  }

  return `${getDirectoryName(filename)}/${toKebabCase(fileStem)}/${helperFileName}`;
}
