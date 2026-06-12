import { getUntrustedModuleOptions } from "#/utils/get-untrusted-module-options";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-types";

// La frontera anticorrupcion como guardrail (axioma A7): cuando los tipos de
// un paquete de terceros mienten (el clasico @types desfasado del runtime
// real), la mentira no se discute en cada archivo — se encierra en UN
// adaptador que re-declara los tipos honestos, y el resto del codigo solo
// conoce el adaptador.

export const untrustedModuleRequiresAdapter: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los modulos declarados como no confiables (tipos que mienten) solo se importan desde su adaptador: la mentira vive en un archivo, no en todos.",
    },
    messages: {
      untrustedImport:
        "`{{moduleSource}}` esta declarado como modulo de tipos NO confiables: importalo solo desde su adaptador ({{adapters}}). El adaptador es la frontera anticorrupcion: re-declara ahi los tipos honestos (lo que el runtime de verdad devuelve) y exporta esa version; el resto del codigo importa el adaptador y razona con tipos veraces. Asi la mentira de terceros vive en UN archivo auditable, no regada por el proyecto.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          adapterFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          modules: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getUntrustedModuleOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (
      options.modules.length === 0 ||
      matchesAnyGlob(filename, options.allowFilePatterns) ||
      matchesAnyGlob(filename, options.adapterFilePatterns)
    ) {
      return {};
    }

    return {
      ImportDeclaration(node: RuleNode) {
        const source = node.source.value;

        if (typeof source !== "string") {
          return;
        }

        const isUntrusted = options.modules.some(
          (moduleName: string) =>
            source === moduleName || source.startsWith(`${moduleName}/`),
        );

        if (!isUntrusted) {
          return;
        }

        context.report({
          data: {
            adapters: options.adapterFilePatterns.join(", ") || "sin definir",
            moduleSource: source,
          },
          messageId: "untrustedImport",
          node,
        });
      },
    };
  },
};
