import { existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const sourceExtensions = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mts",
  ".cts",
  ".mjs",
  ".cjs",
];

export function resolveLocalImportFile(options: {
  aliasPrefixes: readonly string[];
  importSource: string;
  importerFile: string;
  indexFileNames: readonly string[];
  sourceRoot: string;
}) {
  const relativeImport = options.importSource.startsWith(".");
  const aliasPrefix = options.aliasPrefixes.find((prefix) =>
    options.importSource.startsWith(prefix),
  );
  const isExternalImport = !relativeImport && !aliasPrefix;
  if (isExternalImport) {
    return { kind: "external" } as const;
  }

  const candidate = relativeImport
    ? resolve(dirname(options.importerFile), options.importSource)
    : resolve(
        options.sourceRoot,
        options.importSource.slice(aliasPrefix?.length ?? 0),
      );
  const fileCandidates = [
    candidate,
    ...sourceExtensions.map((extension) => `${candidate}${extension}`),
    ...options.indexFileNames.map((indexFileName) =>
      join(candidate, indexFileName),
    ),
  ];
  const filePath = fileCandidates.find(
    (fileCandidate) =>
      existsSync(fileCandidate) && statSync(fileCandidate).isFile(),
  );

  return filePath
    ? ({ filePath, kind: "resolved" } as const)
    : ({ candidatePath: candidate, kind: "unresolved" } as const);
}
