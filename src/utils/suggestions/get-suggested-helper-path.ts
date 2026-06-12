import { getDirectoryName } from "#/utils/project/get-directory-name";
import { getSuggestedHelperFileName } from "./get-suggested-helper-file-name";
import { isNextConventionFile } from "#/utils/project/is-next-convention-file";
import { toKebabCase } from "#/utils/to-kebab-case";

type SuggestedHelperPathInput = {
  extension: string;
  fileStem: string;
  filename: string;
  functionName: string;
};

export function getSuggestedHelperPath({
  extension,
  fileStem,
  filename,
  functionName,
}: SuggestedHelperPathInput) {
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
