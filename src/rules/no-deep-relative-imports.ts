import type { TSESTree } from "@typescript-eslint/utils";
import { countParentSegments } from "#/utils/project/count-parent-segments";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

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

    function reportIfTooDeep(source: TSESTree.StringLiteral | null) {
      const lacksImportSource = !source || typeof source.value !== "string";
      if (lacksImportSource) {
        return;
      }

      const importSource = source.value;
      const depth = countParentSegments(importSource);

      const staysWithinImportDepth = depth <= maxDepth;
      if (staysWithinImportDepth) {
        return;
      }

      context.report({
        data: {
          depth: String(depth),
          maxDepth: String(maxDepth),
          source: importSource,
        },
        messageId: "deepRelativeImport",
        node: source,
      });
    }

    return {
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        reportIfTooDeep(node.source);
      },
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        reportIfTooDeep(node.source);
      },
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        reportIfTooDeep(node.source);
      },
      ImportExpression(node: TSESTree.ImportExpression) {
        reportIfTooDeep(
          node.source.type === "Literal" && typeof node.source.value === "string"
            ? node.source
            : null,
        );
      },
    };
  },
};
