import type { TSESTree } from "@typescript-eslint/utils";
import { basename, dirname, resolve } from "node:path";
import { getDomainSuggestion } from "#/utils/dump-folders/get-domain-suggestion";
import { getDumpFolderInfo } from "#/utils/dump-folders/get-dump-folder-info";
import { getDumpFolderStructureSuggestion } from "#/utils/dump-folders/get-dump-folder-structure-suggestion";
import { extractContentSignature } from "#/utils/dump-folders/extract-content-signature";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { getNoFlatDumpFolderOptions } from "#/utils/options/get-no-flat-dump-folder-options";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

const sourceFilePattern = /\.(?:ts|tsx)$/;

export const noFlatDumpFolder: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Evita que carpetas cajon de sastre como utils/ o helpers/ vuelvan a acumular archivos sueltos: cada util vive en un subdominio.",
    },
    messages: {
      flatDumpFolder:
        "El archivo `{{fileName}}` cayo directo en `{{folderName}}/`: ese nombre no afirma ningun dominio. {{domainSuggestion}}\n\nArbol esperado:\n{{structureSuggestion}}\n\nEl dominio se nombra por lo que sus archivos comparten, no por generalidad: helpers2/ o misc/ solo recrean el cajon.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          dumpFolderNames: {
            items: { type: "string" },
            type: "array",
          },
          maxLooseFiles: {
            minimum: 0,
            type: "number",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNoFlatDumpFolderOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const lacksTextReader = !sourceCode.getText;
    if (lacksTextReader) {
      return {};
    }

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    const absoluteFilename = resolve(context.cwd ?? process.cwd(), filename);
    const fileName = basename(absoluteFilename);
    const parentFolderPath = dirname(absoluteFilename);
    const folderName = basename(parentFolderPath);
    const isSourceFile = sourceFilePattern.test(fileName);
    const isIndexFile = fileName === "index.ts" || fileName === "index.tsx";
    const isDumpFolderName = options.dumpFolderNames.includes(folderName);
    const shouldCheckFile = isSourceFile && !isIndexFile && isDumpFolderName;
    if (!shouldCheckFile) {
      return {};
    }

    return {
      Program(node: TSESTree.Program) {
        const folderInfo = getDumpFolderInfo(parentFolderPath);
        const looseFileCount = folderInfo.directSourceFileNames.length;
        const isWithinLooseFileBudget = looseFileCount <= options.maxLooseFiles;
        if (isWithinLooseFileBudget) {
          return;
        }

        const sourceText = sourceCode.getText?.(node) ?? "";
        const fileSignature = extractContentSignature(sourceText);
        const domainSuggestion = getDomainSuggestion(fileSignature, folderInfo);

        context.report({
          data: {
            domainSuggestion: domainSuggestion.message,
            fileName,
            folderName,
            structureSuggestion: getDumpFolderStructureSuggestion({
              domainNames: folderInfo.domainNames,
              fileName,
              folderName,
              suggestedDomain: domainSuggestion.suggestedDomain,
            }),
          },
          messageId: "flatDumpFolder",
          node,
        });
      },
    };
  },
};
