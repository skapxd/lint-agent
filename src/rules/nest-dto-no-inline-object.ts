import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getNestDtoNoInlineObjectOptions } from "#/utils/options/get-nest-dto-no-inline-object-options";
import { isPublicInstanceProperty } from "#/utils/ast/is-public-instance-property";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const nestDtoNoInlineObject: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los objetos anidados de un DTO se modelan como clases DTO para que @nestjs/swagger los introspeccione.",
    },
    messages: {
      inlineObjectInDto:
        "La propiedad `{{name}}` del DTO usa un objeto anidado sin modelar (tipo inline o `type: Object`). El plugin de @nestjs/swagger solo introspecciona clases: asi el swagger.json sale vacio y el cliente generado recibe un `object` opaco. Extrae el objeto a su propia clase DTO con `@ApiProperty` por campo y referenciala (`@ApiProperty({ type: FooDto }) campo: FooDto`).",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          apiPropertyDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          dtoFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestDtoNoInlineObjectOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns) ||
      !matchesAnyGlob(filename, options.dtoFilePatterns);
    if (
      isAllowedFilePattern
    ) {
      return {};
    }

    return {
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        // Swagger solo serializa propiedades públicas de instancia.
        const isPublicInstancePropertyNode = isPublicInstanceProperty(node);
        if (!isPublicInstancePropertyNode) {
          return;
        }

        const annotation = node.typeAnnotation?.typeAnnotation;
        const hasDirectInlineObjectType = annotation?.type === "TSTypeLiteral";
        const hasArrayInlineObjectType =
          annotation?.type === "TSArrayType" &&
          annotation.elementType.type === "TSTypeLiteral";
        const hasGenericArrayInlineObjectType =
          annotation?.type === "TSTypeReference" &&
          annotation.typeName.type === "Identifier" &&
          annotation.typeName.name === "Array" &&
          annotation.typeArguments?.params[0]?.type === "TSTypeLiteral";
        const hasInlineObjectType =
          hasDirectInlineObjectType ||
          hasArrayInlineObjectType ||
          hasGenericArrayInlineObjectType;

        function hasOpaqueObjectApiPropertyDecorator(
          decorator: TSESTree.Decorator,
        ) {
          const decoratorName = getDecoratorName(decorator);
          const isTrackedApiProperty = Boolean(
            decoratorName &&
              options.apiPropertyDecoratorNames.includes(decoratorName),
          );
          if (!isTrackedApiProperty) {
            return false;
          }

          const expression = decorator.expression;
          const isDecoratorCall = expression.type === "CallExpression";
          if (!isDecoratorCall) {
            return false;
          }

          const firstArgument = expression.arguments[0];
          const hasObjectExpressionArgument = firstArgument?.type === "ObjectExpression";
          if (!hasObjectExpressionArgument) {
            return false;
          }

          const typeProperty = firstArgument.properties.find((property) => {
            const isRegularProperty = property.type === "Property";
            if (!isRegularProperty) {
              return false;
            }

            return getPropertyName(property.key) === "type";
          });
          const hasTypeProperty = typeProperty?.type === "Property";
          if (!hasTypeProperty) {
            return false;
          }

          const hasSchemaProperties = firstArgument.properties.some((property) => {
            const isRegularProperty = property.type === "Property";
            if (!isRegularProperty) {
              return false;
            }

            return getPropertyName(property.key) === "properties";
          });

          const value = typeProperty.value;
          const isObjectIdentifier = value.type === "Identifier" && value.name === "Object";
          const isOpaqueObjectLiteral =
            value.type === "Literal" &&
            value.value === "object" &&
            !hasSchemaProperties;

          return isObjectIdentifier || isOpaqueObjectLiteral;
        }
        const hasOpaqueObjectApiProperty = node.decorators.some(
          hasOpaqueObjectApiPropertyDecorator,
        );

        const usesOpaqueObject = hasInlineObjectType || hasOpaqueObjectApiProperty;
        if (!usesOpaqueObject) {
          return;
        }

        context.report({
          data: { name: getPropertyName(node.key) },
          messageId: "inlineObjectInDto",
          node: node.key,
        });
      },
    };
  },
};
