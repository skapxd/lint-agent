import { readFileSync } from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import type { TSESTree } from "@typescript-eslint/utils";
import { trySafe } from "@skapxd/result";
import { resolveLocalImportFile } from "#/utils/imports/resolve-local-import-file";
import { getNoInternalModuleImportsOptions } from "#/utils/options/get-no-internal-module-imports-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { isInsideDirectory } from "#/utils/project/is-inside-directory";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

const relativeExportPattern =
  /\bexport\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+["']\.[^"']*["']/;

export const noInternalModuleImports: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe importar archivos internos de una carpeta que declara API publica con un index barrel.",
    },
    messages: {
      internalModuleImport:
        "El modulo `{{boundary}}` declara API publica en `{{publicImport}}`. No importes `{{source}}` desde afuera: reexporta el simbolo en el index o mueve el consumidor dentro del modulo.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          aliasPrefixes: {
            items: { type: "string" },
            type: "array",
          },
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          indexFileNames: {
            items: { type: "string" },
            type: "array",
          },
          sourceRoot: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNoInternalModuleImportsOptions(context.options[0]);
    const cwd = context.cwd ?? process.cwd();
    const projectRoot = resolve(cwd);
    const sourceRoot = resolve(projectRoot, options.sourceRoot);
    const filename = context.filename ?? context.getFilename();
    const absoluteFilename = resolve(projectRoot, filename);
    const filenameIsAllowed = matchesAnyGlob(
      absoluteFilename,
      options.allowFilePatterns,
    );
    if (filenameIsAllowed) {
      return {};
    }

    const pathSeparator = sep;

    function normalizePath(pathName: string) {
      return pathName.replaceAll(pathSeparator, "/");
    }

    function findModuleBoundary(importFile: string) {
      let currentDirectory = dirname(importFile);

      while (isInsideDirectory(projectRoot, currentDirectory)) {
        for (const indexFileName of options.indexFileNames) {
          const indexFile = join(currentDirectory, indexFileName);
          const indexSource = trySafe(() => readFileSync(indexFile, "utf8"));
          const indexIsUnreadable = !indexSource.ok;
          if (indexIsUnreadable) {
            continue;
          }

          const indexDeclaresPublicBarrel = relativeExportPattern.test(
            indexSource.value,
          );
          if (indexDeclaresPublicBarrel) {
            return { directory: currentDirectory, indexFile };
          }
        }

        const parentDirectory = dirname(currentDirectory);
        const reachedFilesystemRoot = parentDirectory === currentDirectory;
        if (reachedFilesystemRoot) {
          return null;
        }

        currentDirectory = parentDirectory;
      }

      return null;
    }

    function createRelativeImportToBoundary(boundaryDirectory: string) {
      const importDirectory = dirname(absoluteFilename);
      const relativePath = normalizePath(relative(importDirectory, boundaryDirectory));
      const alreadyRelative = relativePath.startsWith(".");

      return alreadyRelative ? relativePath : `./${relativePath}`;
    }

    function createPublicImportSource(
      importSource: string,
      boundaryDirectory: string,
    ) {
      const aliasPrefix = options.aliasPrefixes.find((prefix) =>
        importSource.startsWith(prefix),
      );
      if (aliasPrefix) {
        const boundaryFromSourceRoot = normalizePath(
          relative(sourceRoot, boundaryDirectory),
        );

        return `${aliasPrefix}${boundaryFromSourceRoot}`;
      }

      return createRelativeImportToBoundary(boundaryDirectory);
    }

    function reportIfInternalImport(source: TSESTree.StringLiteral | null) {
      const lacksImportSource = !source || typeof source.value !== "string";
      if (lacksImportSource) {
        return;
      }

      const importSource = source.value;
      const resolution = resolveLocalImportFile({
        aliasPrefixes: options.aliasPrefixes,
        importerFile: absoluteFilename,
        importSource,
        indexFileNames: options.indexFileNames,
        sourceRoot,
      });
      const lacksResolvedImport = resolution.kind !== "resolved";
      if (lacksResolvedImport) {
        return;
      }
      const importFile = resolution.filePath;

      const boundary = findModuleBoundary(importFile);
      const lacksBoundary = !boundary;
      if (lacksBoundary) {
        return;
      }

      const importsBoundaryIndex =
        normalizePath(importFile) === normalizePath(boundary.indexFile);
      if (importsBoundaryIndex) {
        return;
      }

      const importerLivesInsideBoundary = isInsideDirectory(
        boundary.directory,
        absoluteFilename,
      );
      if (importerLivesInsideBoundary) {
        return;
      }

      context.report({
        data: {
          boundary: normalizePath(relative(projectRoot, boundary.directory)),
          publicImport: createPublicImportSource(importSource, boundary.directory),
          source: importSource,
        },
        messageId: "internalModuleImport",
        node: source,
      });
    }

    return {
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        reportIfInternalImport(node.source);
      },
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        reportIfInternalImport(node.source);
      },
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        reportIfInternalImport(node.source);
      },
      ImportExpression(node: TSESTree.ImportExpression) {
        reportIfInternalImport(
          node.source.type === "Literal" && typeof node.source.value === "string"
            ? node.source
            : null,
        );
      },
    };
  },
};
