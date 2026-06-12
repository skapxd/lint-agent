import { countParentSegments } from "#/utils/count-parent-segments";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

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
  create(context: RuleContext) {
    const maxDepthOption = context.options[0]?.maxDepth;
    const maxDepth = typeof maxDepthOption === "number" ? maxDepthOption : 0;

    function reportIfTooDeep(source: RuleNode) {
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
      ExportAllDeclaration(node: RuleNode) {
        reportIfTooDeep(node.source);
      },
      ExportNamedDeclaration(node: RuleNode) {
        reportIfTooDeep(node.source);
      },
      ImportDeclaration(node: RuleNode) {
        reportIfTooDeep(node.source);
      },
      ImportExpression(node: RuleNode) {
        reportIfTooDeep(node.source);
      },
    };
  },
};
