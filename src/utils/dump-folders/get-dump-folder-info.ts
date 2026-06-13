import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { extractContentSignature } from "#/utils/dump-folders/extract-content-signature";
import type {
  ContentSignature,
  DumpFolderInfo,
} from "#/utils/dump-folders/types";

const sourceFilePattern = /\.(?:ts|tsx)$/;
const dumpFolderInfoCache = new Map<string, DumpFolderInfo>();

export function getDumpFolderInfo(folderPath: string): DumpFolderInfo {
  const cachedInfo = dumpFolderInfoCache.get(folderPath);
  const hasCachedInfo = cachedInfo !== undefined;
  if (hasCachedInfo) {
    return cachedInfo;
  }

  const directSourceFileNames: string[] = [];
  const domainNames: string[] = [];
  const domainSignatures = new Map<string, ContentSignature>();
  const entries = readdirSync(folderPath, { withFileTypes: true });

  const collectSourceFiles = (directoryPath: string): string[] => {
    const sourceFiles: string[] = [];
    const childEntries = readdirSync(directoryPath, { withFileTypes: true });

    for (const childEntry of childEntries) {
      const childPath = join(directoryPath, childEntry.name);
      const isDirectoryEntry = childEntry.isDirectory();
      if (isDirectoryEntry) {
        sourceFiles.push(...collectSourceFiles(childPath));
        continue;
      }

      const isFileEntry = childEntry.isFile();
      if (!isFileEntry) {
        continue;
      }

      const isSourceFile = sourceFilePattern.test(childEntry.name);
      if (!isSourceFile) {
        continue;
      }

      sourceFiles.push(childPath);
    }

    return sourceFiles;
  };

  const mergeSignature = (
    target: ContentSignature,
    source: ContentSignature,
  ): void => {
    for (const key of source.keys) {
      target.keys.add(key);
    }

    for (const kind of ["ast", "identifier", "import"] as const) {
      for (const example of source.examples[kind]) {
        const alreadyHasExample = target.examples[kind].includes(example);
        if (alreadyHasExample) {
          continue;
        }

        const hasEnoughExamples = target.examples[kind].length >= 4;
        if (hasEnoughExamples) {
          continue;
        }

        target.examples[kind].push(example);
      }
    }
  };

  for (const entry of entries) {
    const isDirectoryEntry = entry.isDirectory();
    if (isDirectoryEntry) {
      domainNames.push(entry.name);
      continue;
    }

    const isFileEntry = entry.isFile();
    if (!isFileEntry) {
      continue;
    }

    const isSourceFile = sourceFilePattern.test(entry.name);
    if (!isSourceFile) {
      continue;
    }

    const isIndexFile = entry.name === "index.ts" || entry.name === "index.tsx";
    if (isIndexFile) {
      continue;
    }

    directSourceFileNames.push(entry.name);
  }

  domainNames.sort((left, right) => left.localeCompare(right));
  directSourceFileNames.sort((left, right) => left.localeCompare(right));

  for (const domainName of domainNames) {
    const signature: ContentSignature = {
      examples: { ast: [], identifier: [], import: [] },
      keys: new Set<string>(),
    };
    const domainPath = join(folderPath, domainName);
    const domainSourceFiles = collectSourceFiles(domainPath);

    for (const sourceFile of domainSourceFiles) {
      const sourceText = readFileSync(sourceFile, "utf8");
      mergeSignature(signature, extractContentSignature(sourceText));
    }

    domainSignatures.set(domainName, signature);
  }

  const folderInfo = {
    directSourceFileNames,
    domainNames,
    domainSignatures,
  };
  dumpFolderInfoCache.set(folderPath, folderInfo);

  return folderInfo;
}
