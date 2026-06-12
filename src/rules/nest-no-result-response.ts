import { getNestNoResultResponseOptions } from "#/utils/get-nest-no-result-response-options";
import { getTypeContext } from "#/utils/get-type-context";
import { hasClassDecoratorNamed } from "#/utils/has-class-decorator-named";
import { isSkapxdResultOrPromiseResultType } from "#/utils/is-skapxd-result-or-promise-result-type";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

const typescriptCallSignatureKind = 0;

export const nestNoResultResponse: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los metodos de un @Controller no retornan Result: el envelope { ok, error } se serializaria al cliente.",
    },
    messages: {
      nestNoResultResponse:
        "El metodo `{{name}}` del controller retorna un Result: Nest lo serializa tal cual y el cliente recibe `{ ok: false, error: {...} }` con tus internals. El controller es la frontera: consume el Result con `match()` — la rama ok retorna el DTO, la rama err hace `throw new HttpException(...)` (o la excepcion de dominio que tu filter global entiende).",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          controllerDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: LegacyAstNode) {
    const options = getNestNoResultResponseOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);

    if (!typeContext || matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    const activeTypeContext = typeContext;

    function methodReturnsResult(node: LegacyAstNode) {
      const methodType = activeTypeContext.services.getTypeAtLocation(node.value);
      const signatures = activeTypeContext.checker.getSignaturesOfType(
        methodType,
        typescriptCallSignatureKind,
      );

      return signatures.some((signature: LegacyAstNode) =>
        isSkapxdResultOrPromiseResultType(
          activeTypeContext.checker.getReturnTypeOfSignature(signature),
          activeTypeContext,
        ),
      );
    }

    return {
      MethodDefinition(node: LegacyAstNode) {
        if (node.kind !== "method") {
          return;
        }

        const classNode = node.parent?.parent;

        if (
          !classNode ||
          !hasClassDecoratorNamed(classNode, options.controllerDecoratorNames)
        ) {
          return;
        }

        if (methodReturnsResult(node)) {
          context.report({
            data: { name: node.key?.name ?? "anonymous" },
            messageId: "nestNoResultResponse",
            node: node.key ?? node,
          });
        }
      },
    };
  },
};
