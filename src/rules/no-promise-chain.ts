import { getTypeContext } from "#/utils/get-type-context";
import { isMemberPropertyNamed } from "#/utils/is-member-property-named";
import { isPromiseType } from "#/utils/is-promise-type";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

const defaultMethods = ["catch", "finally", "then"];

export const noPromiseChain: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe encadenar .then/.catch/.finally en promesas; usa await (envuelto en trySafe).",
    },
    messages: {
      noPromiseChain:
        "No encadenes `.{{method}}()` en una promesa. La unica forma de tratar funciones asincronas es `await`: o la funcion llamada ya retorna Promise<Result<...>> o envuelve la llamada en `trySafe` de @skapxd/result.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          methods: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: LegacyAstNode) {
    const methods = context.options[0]?.methods ?? defaultMethods;
    const typeContext = getTypeContext(context);

    return {
      CallExpression(node: LegacyAstNode) {
        const callee = node.callee;

        if (callee.type !== "MemberExpression") {
          return;
        }

        const method = methods.find((name: LegacyAstNode) => isMemberPropertyNamed(callee, name));

        if (!method) {
          return;
        }

        // type-aware: solo si el receptor es una promesa. Sin info de tipos
        // (projectService apagado) cae a verificación por nombre.
        if (
          typeContext &&
          !isPromiseType(
            typeContext.services.getTypeAtLocation(callee.object),
            typeContext,
          )
        ) {
          return;
        }

        context.report({
          data: { method },
          messageId: "noPromiseChain",
          node: callee.property,
        });
      },
    };
  },
};
