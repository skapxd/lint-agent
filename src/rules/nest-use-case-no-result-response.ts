import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getNestUseCaseNoResultResponseOptions } from "#/utils/options/get-nest-use-case-no-result-response-options";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isClassDecoratedBySkapxdNest } from "#/utils/nest/is-class-decorated-by-skapxd-nest";
import { isSkapxdResultOrPromiseResultType } from "#/utils/result/is-skapxd-result-or-promise-result-type";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";
import type ts from "typescript";
import tslib from "typescript";

const typescriptCallSignatureKind = 0;

export const nestUseCaseNoResultResponse: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los metodos publicos de un @UseCase no retornan Result: la frontera de aplicacion consume el envelope y lanza excepciones de Nest.",
      requiresTypeChecking: true,
    },
    messages: {
      useCaseReturnsResult:
        "El use-case `{{name}}` declara retorno `Result`: la frontera de aplicacion no propaga el envelope `{ ok, error }` hacia el controller. Un @UseCase consume el Result de la capa baja y, si falla, LANZA la excepcion que tu exception filter mapea a HTTP - devolverlo es maquillaje que el controller tendria que re-mapear a mano. Desenvuelvelo aqui: `return result.match({ ok: (v) => v, err: (e) => { throw new NotFoundException(messageFrom(e)); } })`. Los helpers privados si pueden devolver Result (son plumbing interno).",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          useCaseDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          useCaseDecoratorSource: { type: "string" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestUseCaseNoResultResponseOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);
    const shouldSkipRule = !typeContext || matchesAnyGlob(filename, options.allowFilePatterns);
    if (shouldSkipRule) {
      return {};
    }

    const activeTypeContext = typeContext;

    function methodReturnsResult(node: TSESTree.MethodDefinition) {
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

    function hasConfiguredUseCaseDecorator(classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression) {
      const tsClass = activeTypeContext.services.esTreeNodeToTSNodeMap.get(classNode);
      const isClassNode = tslib.isClassDeclaration(tsClass) || tslib.isClassExpression(tsClass);
      if (!isClassNode) {
        return false;
      }

      return isClassDecoratedBySkapxdNest(
        tsClass,
        activeTypeContext,
        options.useCaseDecoratorNames,
        options.useCaseDecoratorSource,
      );
    }

    return {
      MethodDefinition(node: TSESTree.MethodDefinition) {
        const isMethodMember = node.kind === "method";
        const isPrivateMember = node.accessibility === "private" ||
          node.accessibility === "protected" ||
          node.key.type === "PrivateIdentifier";
        const lacksPublicUseCaseContract = !isMethodMember || isPrivateMember;
        if (lacksPublicUseCaseContract) {
          return;
        }

        const classNode = node.parent.parent;
        const lacksUseCaseDecorator = !hasConfiguredUseCaseDecorator(classNode);
        if (lacksUseCaseDecorator) {
          return;
        }

        const returnsResultValue = methodReturnsResult(node);
        if (returnsResultValue) {
          context.report({
            data: { name: getPropertyName(node.key) },
            messageId: "useCaseReturnsResult",
            node: node.key,
          });
        }
      },
    };
  },
};
