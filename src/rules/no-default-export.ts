import { getNoDefaultExportOptions } from "#/utils/get-no-default-export-options";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

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
  create(context: LegacyAstNode) {
    const options = getNoDefaultExportOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      ExportDefaultDeclaration(node: LegacyAstNode) {
        context.report({ messageId: "noDefaultExport", node });
      },
      // Cubre la forma indirecta: `export { algo as default }`.
      ExportNamedDeclaration(node: LegacyAstNode) {
        for (const specifier of node.specifiers ?? []) {
          const exportedName =
            specifier.exported?.name ?? specifier.exported?.value;

          if (exportedName === "default") {
            context.report({ messageId: "noDefaultExport", node: specifier });
          }
        }
      },
    };
  },
};
