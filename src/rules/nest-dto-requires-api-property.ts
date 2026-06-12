import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getNestDtoApiPropertyOptions } from "#/utils/options/get-nest-dto-api-property-options";
import { isPublicInstanceProperty } from "#/utils/ast/is-public-instance-property";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const nestDtoRequiresApiProperty: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Toda propiedad publica de un DTO lleva @ApiProperty/@ApiPropertyOptional: el contrato HTTP se documenta en el DTO.",
    },
    messages: {
      missingApiProperty:
        "La propiedad `{{name}}` del DTO no tiene @ApiProperty/@ApiPropertyOptional. El contrato HTTP (query, params, body y respuesta) se documenta en el DTO: el plugin de @nestjs/swagger infiere el tipo, pero la descripcion y el ejemplo son intencion tuya. Asi el controller queda libre de decoradores de swagger.",
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
    const options = getNestDtoApiPropertyOptions(context.options[0]);
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

        const hasApiProperty = node.decorators.some((decorator) => {
          const decoratorName = getDecoratorName(decorator);

          return Boolean(
            decoratorName &&
              options.apiPropertyDecoratorNames.includes(decoratorName),
          );
        });

        if (!hasApiProperty) {
          context.report({
            data: { name: getPropertyName(node.key) },
            messageId: "missingApiProperty",
            node: node.key,
          });
        }
      },
    };
  },
};
