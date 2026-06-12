import { getDirectoryName } from "#/utils/project/get-directory-name";
import { getFileName } from "#/utils/project/get-file-name";
import { getSourceExtension } from "#/utils/project/get-source-extension";
import { getSuggestedHelperFileNames } from "./get-suggested-helper-file-names";
import { getTreeChildLines } from "./get-tree-child-lines";
import { isNextConventionFile } from "#/utils/project/is-next-convention-file";
import { toKebabCase } from "#/utils/naming/to-kebab-case";

type StructureSuggestionInput = {
  filename: string;
  functionNames: readonly string[];
};

export function getStructureSuggestion({
  filename,
  functionNames,
}: StructureSuggestionInput) {
  const fileName = getFileName(filename);
  const extension = getSourceExtension(fileName);
  const fileStem = fileName.slice(0, -extension.length);
  const directoryName = getDirectoryName(filename);
  const helperFileNames = getSuggestedHelperFileNames({
    extension,
    fileStem,
    functionNames,
  });

  const isNextConventionFilePath = isNextConventionFile({ fileStem, filename });
  if (isNextConventionFilePath) {
    return [
      `${directoryName}/`,
      ...getTreeChildLines({
        names: [fileName, ...helperFileNames],
      }),
    ].join("\n");
  }

  return [
    `${directoryName}/${toKebabCase(fileStem)}/`,
    ...getTreeChildLines({
      names: [`index${extension}`, ...helperFileNames],
    }),
  ].join("\n");
}
