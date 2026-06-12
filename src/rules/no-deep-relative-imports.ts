import { countParentSegments } from "#/utils/count-parent-segments";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

export const noDeepRelativeImports: RuleModule = {
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
  create(context: LegacyAstNode) {
    const maxDepth = context.options[0]?.maxDepth ?? 0;

    function reportIfTooDeep(source: LegacyAstNode) {
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
      ExportAllDeclaration(node: LegacyAstNode) {
        reportIfTooDeep(node.source);
      },
      ExportNamedDeclaration(node: LegacyAstNode) {
        reportIfTooDeep(node.source);
      },
      ImportDeclaration(node: LegacyAstNode) {
        reportIfTooDeep(node.source);
      },
      ImportExpression(node: LegacyAstNode) {
        reportIfTooDeep(node.source);
      },
    };
  },
};
