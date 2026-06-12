import { getPreferAbortSignalOptions } from "#/utils/options/get-prefer-abort-signal-options";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { hasAbortSignalOption } from "#/utils/async/has-abort-signal-option";
import { isInsideEffectCallback } from "#/utils/react/is-inside-effect-callback";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

export const preferAbortSignal: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "En efectos de React, los listeners se limpian con AbortController, no con removeEventListener.",
    },
    messages: {
      addWithoutSignal:
        "Este addEventListener vive en un efecto sin `signal`. Crea `const controller = new AbortController()`, pasa `{ signal: controller.signal }` como tercer argumento y limpia con `return () => controller.abort()`: un solo abort cubre todos los listeners del efecto.",
      removeInsteadOfAbort:
        "No quites listeners a mano en el cleanup: registra con `{ signal: controller.signal }` y reemplaza este removeEventListener por `return () => controller.abort()`. Evita el bug clasico de pasar una referencia distinta al remover.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          effectNames: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getPreferAbortSignalOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const typeContext = getTypeContext(context);

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      CallExpression(node: RuleNode) {
        if (node.callee?.type !== "MemberExpression") {
          return;
        }

        const isAdd = isMemberPropertyNamed(node.callee, "addEventListener");
        const isRemove = isMemberPropertyNamed(node.callee, "removeEventListener");

        if (!isAdd && !isRemove) {
          return;
        }

        if (!isInsideEffectCallback(node, options.effectNames)) {
          return;
        }

        if (isRemove) {
          context.report({ messageId: "removeInsteadOfAbort", node });
          return;
        }

        if (!hasAbortSignalOption(node, sourceCode, typeContext)) {
          context.report({ messageId: "addWithoutSignal", node });
        }
      },
    };
  },
};
