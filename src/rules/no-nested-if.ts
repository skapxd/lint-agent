import { getNoNestedIfOptions } from "#/utils/options/get-no-nested-if-options";
import { isNestedIfStatement } from "#/utils/ast/is-nested-if-statement";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

export const noNestedIf: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe if anidados; usa retorno anticipado (guard clauses) o match() de ts-pattern.",
    },
    messages: {
      noNestedIf:
        "No anides un if dentro de otro: cada nivel suma carga cognitiva y crea puntos ciegos para las demas reglas. Aplana con retorno anticipado (`if (!x) return ...;` y sigue el camino feliz) o decide con `match()` de ts-pattern si son variantes de un mismo valor.",
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
    const options = getNoNestedIfOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      IfStatement(node: RuleNode) {
        if (isNestedIfStatement(node)) {
          context.report({ messageId: "noNestedIf", node });
        }
      },
    };
  },
};
