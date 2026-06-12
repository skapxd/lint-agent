import { getNestNoResultResponseOptions } from "#/utils/options/get-nest-no-result-response-options";
import { getTypeContext } from "#/utils/get-type-context";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { isAstNode } from "#/utils/is-ast-node";
import { isSkapxdResultOrPromiseResultType } from "#/utils/is-skapxd-result-or-promise-result-type";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";
import type ts from "typescript";

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
  create(context: RuleContext) {
    const options = getNestNoResultResponseOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);

    if (!typeContext || matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    const activeTypeContext = typeContext;

    function methodReturnsResult(node: RuleNode) {
      if (!isAstNode(node.value)) {
        return false;
      }

      const methodType = activeTypeContext.services.getTypeAtLocation(node.value);
      const signatures = activeTypeContext.checker.getSignaturesOfType(
        methodType,
        typescriptCallSignatureKind,
      );

      return signatures.some((signature: ts.Signature) =>
        isSkapxdResultOrPromiseResultType(
          activeTypeContext.checker.getReturnTypeOfSignature(signature),
          activeTypeContext,
        ),
      );
    }

    return {
      MethodDefinition(node: RuleNode) {
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
