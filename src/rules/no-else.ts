import { getNoElseOptions } from "#/utils/get-no-else-options";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-types";

export const noElse: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe else (y else if): el else es el estado sin nombre. Retorno anticipado o match().",
    },
    messages: {
      noElse:
        "El `else` es el estado sin nombre: 'todo lo que no sea la condicion', un complemento anonimo que el lector debe deducir. Nombra los caminos: retorno anticipado (`if (!x) return ...;` y sigue el camino feliz — cada salida declara su condicion), ternario simple para decisiones de valor, o `match().exhaustive()` de ts-pattern para variantes — el compilador exige cubrir cada una, sin cajones de 'lo demas'.",
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
    const options = getNoElseOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      IfStatement(node: RuleNode) {
        if (node.alternate) {
          context.report({ messageId: "noElse", node: node.alternate });
        }
      },
    };
  },
};
