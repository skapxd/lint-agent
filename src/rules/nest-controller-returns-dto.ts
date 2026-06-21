import type { TSESTree } from "@typescript-eslint/utils";
import { getNestControllerReturnsDtoOptions } from "#/utils/options/get-nest-controller-returns-dto-options";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isAllowedNestControllerDtoReturnType } from "#/utils/nest/is-allowed-nest-controller-dto-return-type";
import { isHttpRouteMethod } from "#/utils/nest/is-http-route-method";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { isAstNode } from "#/utils/ast/is-ast-node";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";
import type ts from "typescript";

const typescriptCallSignatureKind = 0;

export const nestControllerReturnsDto: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los metodos de ruta de un @Controller retornan una clase extends Dto() con brand de capa de @skapxd/nest para que @nestjs/swagger genere el response schema sin exponer interfaces, type aliases ni schemas de persistencia.",
      requiresTypeChecking: true,
    },
    messages: {
      missingDtoReturn:
        "El metodo de ruta `{{name}}` no retorna un DTO marcado. Todo retorno de un `@Controller` debe ser una clase que extienda `Dto()` de @skapxd/nest (su brand permite a @nestjs/swagger generar el response schema y evita exponer interfaces, `type` o entities de DB como contrato HTTP). Declara `class FooDto extends Dto()` y retorna `Promise<FooDto>` o `FooDto[]`. Para una respuesta polimorfica usa un Dto contenedor con discriminador, no una union. (Respuestas manuales: `@Res({ passthrough: true })`.)",
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
          dtoLayerSource: { type: "string" },
          gatewayDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          responseHandlerParamDecorators: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestControllerReturnsDtoOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    const shouldSkipRule = !typeContext || isAllowedFilePattern;
    if (shouldSkipRule) {
      return {};
    }

    const activeTypeContext = typeContext;

    function usesManualResponseHandler(node: TSESTree.MethodDefinition) {
      return node.value.params.some((param) =>
        param.decorators.some((decorator) => {
          const decoratorName = getDecoratorName(decorator);

          return Boolean(
            decoratorName &&
              options.responseHandlerParamDecorators.includes(decoratorName),
          );
        }),
      );
    }

    function methodReturnsBrandedDto(node: TSESTree.MethodDefinition) {
      if (!isAstNode(node.value)) {
        return false;
      }

      const methodType = activeTypeContext.services.getTypeAtLocation(node.value);
      const signatures = activeTypeContext.checker.getSignaturesOfType(
        methodType,
        typescriptCallSignatureKind,
      );
      const lacksSignature = signatures.length === 0;
      if (lacksSignature) {
        return false;
      }

      return signatures.every((signature: ts.Signature) =>
        isAllowedNestControllerDtoReturnType(
          activeTypeContext.checker.getReturnTypeOfSignature(signature),
          activeTypeContext,
          options,
        ),
      );
    }

    return {
      MethodDefinition(node: TSESTree.MethodDefinition) {
        const isMethodMember = node.kind === "method";
        if (!isMethodMember) {
          return;
        }

        const classNode = node.parent.parent;
        const lacksControllerClass = !hasClassDecoratorNamed(classNode, options.controllerDecoratorNames);
        const hasGatewayClass = hasClassDecoratorNamed(classNode, options.gatewayDecoratorNames);
        const shouldSkipClass = lacksControllerClass || hasGatewayClass;
        if (shouldSkipClass) {
          return;
        }

        const hasHttpRouteDecorator = node.decorators.some((decorator) => {
          const decoratorName = getDecoratorName(decorator);

          return isHttpRouteMethod(decoratorName?.toUpperCase());
        });
        if (!hasHttpRouteDecorator) {
          return;
        }

        const hasManualResponseHandler = usesManualResponseHandler(node);
        if (hasManualResponseHandler) {
          return;
        }

        const returnsBrandedDto = methodReturnsBrandedDto(node);
        if (returnsBrandedDto) {
          return;
        }

        context.report({
          data: { name: getPropertyName(node.key) },
          messageId: "missingDtoReturn",
          node: node.key,
        });
      },
    };
  },
};
