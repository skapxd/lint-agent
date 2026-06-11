// @ts-nocheck
import { getContainingClassName } from "#/utils/get-containing-class-name";
import { getDecoratorName } from "#/utils/get-decorator-name";
import { getImportedLocalNames } from "#/utils/get-imported-local-names";
import { getNestDtoValidationOptions } from "#/utils/get-nest-dto-validation-options";
import { isPublicInstanceProperty } from "#/utils/is-public-instance-property";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matches-any-pattern";

export const nestDtoRequiresValidation = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Los DTOs de input validan en runtime con class-validator; el tipo de TypeScript solo existe en compilacion.",
    },
    messages: {
      missingValidator:
        "La propiedad `{{name}}` del DTO de input no tiene ningun decorador de class-validator. El tipo de TypeScript desaparece en runtime: sin validador, el ValidationPipe deja pasar cualquier cosa (o la descarta en silencio con whitelist). Decora con @IsString/@IsNumber/@IsEnum/... segun el tipo.",
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
  create(context) {
    const options = getNestDtoValidationOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (
      matchesAnyGlob(filename, options.allowFilePatterns) ||
      !matchesAnyGlob(filename, options.dtoFilePatterns) ||
      matchesAnyGlob(filename, options.outputDtoFilePatterns)
    ) {
      return {};
    }

    let validatorNames = new Set();
    let transformerNames = new Set();

    return {
      Program(node) {
        validatorNames = getImportedLocalNames(node, "class-validator");
        transformerNames = getImportedLocalNames(node, "class-transformer");
      },
      PropertyDefinition(node) {
        if (!isPublicInstanceProperty(node)) {
          return;
        }

        // Las clases de respuesta (UploadDocumentResponseDto, *OutputDto)
        // quedan exentas aunque vivan en un archivo de nombre neutro.
        const className = getContainingClassName(node);

        if (
          className &&
          matchesAnyPattern(className, options.outputDtoClassPatterns)
        ) {
          return;
        }

        const propertyName = node.key?.name ?? "anonymous";
        const decoratorNames = (node.decorators ?? []).map(getDecoratorName);
        const validators = decoratorNames.filter((name) =>
          validatorNames.has(name),
        );

        if (validators.length === 0) {
          context.report({
            data: { name: propertyName },
            messageId: "missingValidator",
            node: node.key ?? node,
          });

          return;
        }

        const declaresOptional = decoratorNames.some(
          (name) =>
            validatorNames.has(name) &&
            options.optionalDecoratorNames.includes(name),
        );

        if (node.optional && !declaresOptional) {
          context.report({
            data: { name: propertyName },
            messageId: "optionalRequiresIsOptional",
            node: node.key ?? node,
          });
        }

        const hasValidateNested = decoratorNames.some(
          (name) => name === "ValidateNested" && validatorNames.has(name),
        );
        const hasType = decoratorNames.some(
          (name) => name === "Type" && transformerNames.has(name),
        );

        if (hasValidateNested && !hasType) {
          context.report({
            data: { name: propertyName },
            messageId: "validateNestedRequiresType",
            node: node.key ?? node,
          });
        }
      },
    };
  },
};
