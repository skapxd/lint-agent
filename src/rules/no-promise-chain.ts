import type { TSESTree } from "@typescript-eslint/utils";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { isPromiseType } from "#/utils/type-aware/is-promise-type";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

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
  create(context: RuleContext) {
    const methodsOption = context.options[0]?.methods;
    const methods =
      Array.isArray(methodsOption) &&
      methodsOption.every((method) => typeof method === "string")
        ? methodsOption
        : defaultMethods;
    const typeContext = getTypeContext(context);

    return {
      CallExpression(node: TSESTree.CallExpression) {
        const callee = node.callee;

        const hasMemberCallee = callee.type === "MemberExpression";
        if (!hasMemberCallee) {
          return;
        }

        const method = methods.find((name: string) =>
          isMemberPropertyNamed(callee, name),
        );

        if (!method) {
          return;
        }

        // type-aware: solo si el receptor es una promesa. Sin info de tipos
        // (projectService apagado) cae a verificación por nombre.
        const isNonPromiseReceiver = typeContext &&
          !isPromiseType(
            typeContext.services.getTypeAtLocation(callee.object),
            typeContext,
          );
        if (
          isNonPromiseReceiver
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
