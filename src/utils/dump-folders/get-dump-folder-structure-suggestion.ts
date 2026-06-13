import { getTreeChildLines } from "#/utils/suggestions/get-tree-child-lines";

type DumpFolderStructureSuggestionInput = {
  domainNames: readonly string[];
  fileName: string;
  folderName: string;
  suggestedDomain: string | null;
};

export function getDumpFolderStructureSuggestion({
  domainNames,
  fileName,
  folderName,
  suggestedDomain,
}: DumpFolderStructureSuggestionInput) {
  const targetDomain = suggestedDomain ?? "<dominio>";
  const shownDomains = [...domainNames, targetDomain]
    .filter((domainName, index, names) => names.indexOf(domainName) === index)
    .sort((left, right) => left.localeCompare(right));
  const childLines = getTreeChildLines({
    names: shownDomains.map((domainName) =>
      domainName === targetDomain ? `${domainName}/${fileName}` : `${domainName}/`,
    ),
  });

  return [`${folderName}/`, ...childLines].join("\n");
}
