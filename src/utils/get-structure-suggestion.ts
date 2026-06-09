// @ts-nocheck
import { getDirectoryName } from "./get-directory-name";
import { getFileName } from "./get-file-name";
import { getSourceExtension } from "./get-source-extension";
import { getSuggestedHelperFileNames } from "./get-suggested-helper-file-names";
import { getTreeChildLines } from "./get-tree-child-lines";
import { isNextConventionFile } from "./is-next-convention-file";
import { toKebabCase } from "./to-kebab-case";

export function getStructureSuggestion({ filename, functionNames }) {
  const fileName = getFileName(filename);
  const extension = getSourceExtension(fileName);
  const fileStem = fileName.slice(0, -extension.length);
  const directoryName = getDirectoryName(filename);
  const helperFileNames = getSuggestedHelperFileNames({
    extension,
    fileStem,
    functionNames,
  });

  if (isNextConventionFile({ fileStem, filename })) {
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
