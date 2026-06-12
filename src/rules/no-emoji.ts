import type { TSESTree } from "@typescript-eslint/utils";
import { containsEmoji } from "#/utils/text/contains-emoji";
import { getNoEmojiOptions } from "#/utils/options/get-no-emoji-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const noEmoji: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe emojis en strings y JSX; cada sistema los renderiza distinto (o no los renderiza).",
    },
    messages: {
      noEmoji:
        "No uses emojis en el codigo: se renderizan con la fuente del sistema del usuario, distinta en cada plataforma (y ausente en algunos Linux, donde sale un cuadro vacio). Reemplazalo por un icono SVG con el mismo significado (p. ej. lucide-react) o un asset SVG propio.",
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
    const options = getNoEmojiOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    function reportIfEmoji(node: TSESTree.Node, value: unknown) {
      const containsEmojiText = typeof value === "string" && containsEmoji(value);
      if (containsEmojiText) {
        context.report({ messageId: "noEmoji", node });
      }
    }

    return {
      JSXText(node: TSESTree.JSXText) {
        reportIfEmoji(node, node.value);
      },
      Literal(node: TSESTree.Literal) {
        reportIfEmoji(node, node.value);
      },
      TemplateElement(node: TSESTree.TemplateElement) {
        reportIfEmoji(node, typeof node.value === "object" ? node.value.raw : null);
      },
    };
  },
};
