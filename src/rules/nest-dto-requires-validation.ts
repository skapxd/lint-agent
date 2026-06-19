import type { TSESTree } from "@typescript-eslint/utils";
import { getContainingClassName } from "#/utils/ast/get-containing-class-name";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getImportedLocalNames } from "#/utils/imports/get-imported-local-names";
import { getNestDtoValidationOptions } from "#/utils/options/get-nest-dto-validation-options";
import { isPublicInstanceProperty } from "#/utils/ast/is-public-instance-property";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matching/matches-any-pattern";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const nestDtoRequiresValidation: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Todo DTO valida en runtime con class-validator; el tipo de TypeScript solo existe en compilacion.",
    },
    messages: {
      missingValidator:
        "La propiedad `{{name}}` del DTO no tiene ningun decorador de class-validator. El tipo de TS desaparece en runtime: sin validador no hay contrato (y con Mongo schemaless es la unica garantia). Decora segun el tipo (@IsString/@IsNumber/@IsEnum/...); para uniones discriminadas o genericos que class-validator no expresa bien, modela con zod/valibot (ver prefer-schema-validation), no escapes con @Allow() ni unknown.",
      optionalRequiresIsOptional:
        "La propiedad `{{name}}` es opcional en el tipo (`?`) pero no tiene @IsOptional: en runtime el ValidationPipe la rechazara cuando falte, contradiciendo el tipo. Anota @IsOptional() (o quita el `?` si en realidad es obligatoria).",
      validateNestedRequiresType:
        "`{{name}}` tiene @ValidateNested sin @Type(() => Clase) de class-transformer: el objeto anidado llega como plain object y la validacion anidada NO corre — el bug silencioso clasico. Agrega @Type(() => SuDtoClase).",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          dtoFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          optionalDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          outputDtoClassPatterns: {
            items: { type: "string" },
            type: "array",
          },
          outputDtoFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNestDtoValidationOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedDtoFilePattern = matchesAnyGlob(filename, options.allowFilePatterns) ||
      !matchesAnyGlob(filename, options.dtoFilePatterns) ||
      matchesAnyGlob(filename, options.outputDtoFilePatterns);
    if (
      isAllowedDtoFilePattern
    ) {
      return {};
    }

    let validatorNames = new Set();
    let transformerNames = new Set();

    return {
      Program(node: TSESTree.Program) {
        validatorNames = getImportedLocalNames(node, "class-validator");
        transformerNames = getImportedLocalNames(node, "class-transformer");
      },
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        const isPublicInstancePropertyNode = isPublicInstanceProperty(node);
        if (!isPublicInstancePropertyNode) {
          return;
        }

        // Los consumidores pueden eximir clases concretas por regex cuando
        // deciden modelar ciertos outputs fuera de class-validator.
        const className = getContainingClassName(node);

        const isTrackedOutputDto = className &&
          matchesAnyPattern(className, options.outputDtoClassPatterns);
        if (
          isTrackedOutputDto
        ) {
          return;
        }

        const propertyName = getPropertyName(node.key);
        const decoratorNames = node.decorators.map(getDecoratorName);
        const validators = decoratorNames.filter(
          (name: string | null): name is string =>
            Boolean(name && validatorNames.has(name)),
        );

        const hasNoValidators = validators.length === 0;
        if (hasNoValidators) {
          context.report({
            data: { name: propertyName },
            messageId: "missingValidator",
            node: node.key,
          });

          return;
        }

        const declaresOptional = decoratorNames.some(
          (name: string | null) =>
            typeof name === "string" &&
            validatorNames.has(name) &&
            options.optionalDecoratorNames.includes(name),
        );

        const needsIsOptionalDecorator = node.optional && !declaresOptional;
        if (needsIsOptionalDecorator) {
          context.report({
            data: { name: propertyName },
            messageId: "optionalRequiresIsOptional",
            node: node.key,
          });
        }

        const hasValidateNested = decoratorNames.some(
          (name: string | null) =>
            name === "ValidateNested" && validatorNames.has(name),
        );
        const hasType = decoratorNames.some(
          (name: string | null) => name === "Type" && transformerNames.has(name),
        );

        const needsNestedTypeDecorator = hasValidateNested && !hasType;
        if (needsNestedTypeDecorator) {
          context.report({
            data: { name: propertyName },
            messageId: "validateNestedRequiresType",
            node: node.key,
          });
        }
      },
    };
  },
};
