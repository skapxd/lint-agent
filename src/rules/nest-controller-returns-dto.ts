import type { TSESTree } from "@typescript-eslint/utils";
import { getNestControllerReturnsDtoOptions } from "#/utils/options/get-nest-controller-returns-dto-options";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getTypeReferenceName } from "#/utils/typescript/get-type-reference-name";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { isHttpRouteMethod } from "#/utils/nest/is-http-route-method";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const nestControllerReturnsDto: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los metodos de ruta de un @Controller declaran un DTO como tipo de retorno para que @nestjs/swagger genere el response schema.",
    },
    messages: {
      missingDtoReturn:
        "El metodo de ruta `{{name}}` no declara un DTO como tipo de retorno. El plugin de @nestjs/swagger genera el response schema desde el tipo de retorno: sin un DTO explicito (clase), el swagger.json queda sin schema y el cliente generado recibe `any`. Declara `: Promise<FooDto>` (o `FooDto[]`). Para respuestas sin cuerpo usa `Promise<void>`.",
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
          gatewayDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          requireDtoSuffix: { type: "boolean" },
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
    const primitiveReturnTypes = new Set([
      "TSStringKeyword",
      "TSNumberKeyword",
      "TSBooleanKeyword",
    ]);

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    function isAllowedWrappedReturnType(annotation: TSESTree.TSTypeReference): boolean {
      const wrappedType = annotation.typeArguments?.params[0];
      const lacksWrappedType = !wrappedType;
      if (lacksWrappedType) {
        return false;
      }

      return isAllowedReturnType(wrappedType);
    }

    function isAllowedTypeReference(annotation: TSESTree.TSTypeReference): boolean {
      const typeName = getTypeReferenceName(annotation.typeName);
      const isPromiseOrArrayWrapper = typeName === "Promise" || typeName === "Array";
      if (isPromiseOrArrayWrapper) {
        return isAllowedWrappedReturnType(annotation);
      }

      const isStreamReturnType = Boolean(
        typeName &&
          options.streamReturnTypes.includes(typeName),
      );
      if (isStreamReturnType) {
        return true;
      }

      const acceptsAnyTypeReference = !options.requireDtoSuffix;
      if (acceptsAnyTypeReference) {
        return Boolean(typeName);
      }

      return Boolean(typeName?.endsWith("Dto"));
    }

    function isAllowedReturnType(annotation: TSESTree.TypeNode): boolean {
      const isArrayType = annotation.type === "TSArrayType";
      if (isArrayType) {
        return isAllowedReturnType(annotation.elementType);
      }

      const isTypeReference = annotation.type === "TSTypeReference";
      if (isTypeReference) {
        return isAllowedTypeReference(annotation);
      }

      const isVoidReturnType = annotation.type === "TSVoidKeyword";
      if (isVoidReturnType) {
        return true;
      }

      const isPrimitiveReturnType = primitiveReturnTypes.has(annotation.type);
      if (isPrimitiveReturnType) {
        return options.allowPrimitiveReturns;
      }

      return false;
    }

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

        const hasAllowedReturnType = isAllowedReturnType(returnType);
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
