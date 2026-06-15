import { basename } from "node:path";
import type { TSESTree } from "@typescript-eslint/utils";
import { getExpectedFilename } from "#/utils/filename-matches-root-function/get-expected-filename";
import { getFilenameMatchesRootFunctionOptions } from "#/utils/options/get-filename-matches-root-function-options";
import { getFilenameStem } from "#/utils/filename-matches-root-function/get-filename-stem";
import { getRootFunctionExports } from "#/utils/filename-matches-root-function/get-root-function-exports";
import { isIndexFile } from "#/utils/filename-matches-root-function/is-index-file";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

export const filenameMatchesRootFunction: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Exige que el nombre del archivo sea la version kebab de su funcion raiz exportada.",
    },
    messages: {
      filenameMismatch:
        "El archivo {{filename}} exporta {{exportName}}, pero su nombre deberia ser la version kebab del export: {{expected}}. Con una funcion raiz por archivo, el nombre del archivo ES el nombre de su contenido - asi el arbol se lee como un indice. Renombra el archivo a {{expected}} o el export para que coincidan.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getFilenameMatchesRootFunctionOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    const shouldSkipFile = isAllowedFilePattern || isIndexFile(filename);
    if (shouldSkipFile) {
      return {};
    }

    return {
      Program(node: TSESTree.Program) {
        for (const rootFunctionExport of getRootFunctionExports(node)) {
          const expected = getExpectedFilename(filename, rootFunctionExport.exportName);
          const expectedStem = getFilenameStem(expected);
          const actual = getFilenameStem(filename);
          const filenameMatchesExport = expectedStem === actual;

          if (filenameMatchesExport) {
            continue;
          }

          context.report({
            data: {
              expected,
              exportName: rootFunctionExport.exportName,
              filename: basename(filename),
            },
            messageId: "filenameMismatch",
            node: rootFunctionExport.node,
          });
        }
      },
    };
  },
};
