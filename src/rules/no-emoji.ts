import { containsEmoji } from "#/utils/contains-emoji";
import { getNoEmojiOptions } from "#/utils/options/get-no-emoji-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

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

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    function reportIfEmoji(node: RuleNode, value: unknown) {
      if (typeof value === "string" && containsEmoji(value)) {
        context.report({ messageId: "noEmoji", node });
      }
    }

    return {
      JSXText(node: RuleNode) {
        reportIfEmoji(node, node.value);
      },
      Literal(node: RuleNode) {
        reportIfEmoji(node, node.value);
      },
      TemplateElement(node: RuleNode) {
        reportIfEmoji(node, typeof node.value === "object" ? node.value?.raw : null);
      },
    };
  },
};
