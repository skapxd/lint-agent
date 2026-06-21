import type { TSESTree } from "@typescript-eslint/utils";
import { getNestControllerReturnsDtoOptions } from "#/utils/options/get-nest-controller-returns-dto-options";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { checkNestControllerDtoReturnType } from "#/utils/nest/check-nest-controller-dto-return-type";
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
        "El metodo de ruta `{{name}}` retorna `{{returned}}`, que no es un DTO marcado. @nestjs/swagger genera el schema desde clases con brand: una interface, un `type` o una entity de DB da `any` en el cliente y filtra tu modelo de persistencia. Conviertelo en una clase `extends Dto()` y retornala: `getUser(): Promise<UserDto>` con `class UserDto extends Dto() { @Expose() id!: string }`. Binarios: `class FileDto extends Dto(StreamableFile)`. Respuesta manual: `@Res({ passthrough: true })`.",
      returnsUnionType:
        "El metodo de ruta `{{name}}` retorna una union (`{{returned}}`): un endpoint declara UNA forma, no \"una cosa u otra\". Modela lo polimorfico con un Dto contenedor y un discriminador, no `A | B`: `class PaymentDto extends Dto() { @Expose() status!: \"approved\" | \"rejected\"; @Expose() @Type(() => ApprovedDto) approved?: ApprovedDto; @Expose() @Type(() => RejectedDto) rejected?: RejectedDto }`.",
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

    function evaluateMethodReturn(
      node: TSESTree.MethodDefinition,
    ): { messageId: "missingDtoReturn" | "returnsUnionType"; returned: string } | null {
      if (!isAstNode(node.value)) {
        return {
          messageId: "missingDtoReturn",
          returned: "un retorno sin tipo",
        };
      }

      const methodType = activeTypeContext.services.getTypeAtLocation(node.value);
      const signatures = activeTypeContext.checker.getSignaturesOfType(
        methodType,
        typescriptCallSignatureKind,
      );
      const lacksSignature = signatures.length === 0;
      if (lacksSignature) {
        return {
          messageId: "missingDtoReturn",
          returned: "un retorno sin tipo",
        };
      }

      for (const signature of signatures) {
        const result = checkNestControllerDtoReturnType(
          activeTypeContext.checker.getReturnTypeOfSignature(signature),
          activeTypeContext,
          options,
        );

        const hasInvalidReturnContract = result.status !== "ok";
        if (hasInvalidReturnContract) {
          const reportsUnionReturn = result.status === "union";

          return {
            messageId: reportsUnionReturn ? "returnsUnionType" : "missingDtoReturn",
            returned: result.returned,
          };
        }
      }

      return null;
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

        const failure = evaluateMethodReturn(node);
        if (!failure) {
          return;
        }

        context.report({
          data: { name: getPropertyName(node.key), returned: failure.returned },
          messageId: failure.messageId,
          node: node.key,
        });
      },
    };
  },
};
