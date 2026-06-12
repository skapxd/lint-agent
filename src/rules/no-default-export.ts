import type { TSESTree } from "@typescript-eslint/utils";
import { getNoDefaultExportOptions } from "#/utils/options/get-no-default-export-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const noDefaultExport: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe export default; un export nombrado hace del nombre el contrato del modulo.",
    },
    messages: {
      noDefaultExport:
        "No uses `export default`: un export nombrado hace el simbolo renombrable con el IDE, grepeable y estable en autoimports. Si este archivo es un entrypoint donde un framework o tool exige el default, agrega su glob en `allowFilePatterns` de skapxd/no-default-export (p. ej. \"+page.ts\").",
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
    const options = getNoDefaultExportOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    return {
      ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration) {
        context.report({ messageId: "noDefaultExport", node });
      },
      // Cubre la forma indirecta: `export { algo as default }`.
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        for (const specifier of node.specifiers) {
          const exportedName = specifier.exported.type === "Identifier"
            ? specifier.exported.name
            : specifier.exported.value;

          const isExportedNameDefault = exportedName === "default";
          if (isExportedNameDefault) {
            context.report({ messageId: "noDefaultExport", node: specifier });
          }
        }
      },
    };
  },
};
