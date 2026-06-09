// @ts-nocheck
import { countParentSegments } from "#/utils/count-parent-segments";

export const noDeepRelativeImports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Limita la profundidad de los imports relativos (`../`). Empuja hacia estructuras planas o alias de ruta.",
    },
    messages: {
      deepRelativeImport:
        "El import `{{source}}` sube {{depth}} niveles con `../`. Maximo permitido: {{maxDepth}}. Usa un alias de ruta (ej. `@/...`) o acerca el modulo a quien lo usa.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          maxDepth: { type: "number" },
        },
        type: "object",
      },
    ],
  },
  create(context) {
    const maxDepth = context.options[0]?.maxDepth ?? 0;

    function reportIfTooDeep(source) {
      if (!source || typeof source.value !== "string") {
        return;
      }

      const depth = countParentSegments(source.value);

      if (depth <= maxDepth) {
        return;
      }

      context.report({
        data: {
          depth: String(depth),
          maxDepth: String(maxDepth),
          source: source.value,
        },
        messageId: "deepRelativeImport",
        node: source,
      });
    }

    return {
      ExportAllDeclaration(node) {
        reportIfTooDeep(node.source);
      },
      ExportNamedDeclaration(node) {
        reportIfTooDeep(node.source);
      },
      ImportDeclaration(node) {
        reportIfTooDeep(node.source);
      },
      ImportExpression(node) {
        reportIfTooDeep(node.source);
      },
    };
  },
};
