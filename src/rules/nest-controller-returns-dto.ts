import type { TSESTree } from "@typescript-eslint/utils";
import { getNestControllerReturnsDtoOptions } from "#/utils/options/get-nest-controller-returns-dto-options";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isAllowedNestControllerDtoReturnType } from "#/utils/nest/is-allowed-nest-controller-dto-return-type";
import { isHttpRouteMethod } from "#/utils/nest/is-http-route-method";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

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
        "El metodo de ruta `{{name}}` no retorna un DTO marcado. `@nestjs/swagger` genera el response schema introspeccionando CLASES: una interface, un `type` o un schema de Mongoose/TypeORM no producen schema (el cliente generado recibe `any`) y exponer el modelo de persistencia acopla tu API a la DB. Declara una clase `extends Dto()` de @skapxd/nest y retornala: `: Promise<FooDto>` (o `FooDto[]`). Sin cuerpo: `Promise<void>`. Binarios: `StreamableFile`/`Buffer`, o `extends Dto(StreamableFile)`.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowPrimitiveReturns: { type: "boolean" },
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
          streamReturnTypes: {
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

        const returnType = node.value.returnType?.typeAnnotation;
        const lacksReturnTypeAnnotation = !returnType;
        if (lacksReturnTypeAnnotation) {
          context.report({
            data: { name: getPropertyName(node.key) },
            messageId: "missingDtoReturn",
            node: node.key,
          });

          return;
        }

        const hasAllowedReturnType = isAllowedNestControllerDtoReturnType(
          returnType,
          activeTypeContext,
          options,
        );
        if (hasAllowedReturnType) {
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
