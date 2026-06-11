// @ts-nocheck
import { getNoNestedIfOptions } from "#/utils/get-no-nested-if-options";
import { isNestedIfStatement } from "#/utils/is-nested-if-statement";
import { matchesAnyGlob } from "#/utils/matches-any-glob";

export const noNestedIf = {
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
  create(context) {
    const options = getNoNestedIfOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      IfStatement(node) {
        if (isNestedIfStatement(node)) {
          context.report({ messageId: "noNestedIf", node });
        }
      },
    };
  },
};
