import { getDecoratorName } from "#/utils/get-decorator-name";
import { getNestDtoApiPropertyOptions } from "#/utils/get-nest-dto-api-property-options";
import { isPublicInstanceProperty } from "#/utils/is-public-instance-property";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

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
  create(context: LegacyAstNode) {
    const options = getNestDtoApiPropertyOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (
      matchesAnyGlob(filename, options.allowFilePatterns) ||
      !matchesAnyGlob(filename, options.dtoFilePatterns)
    ) {
      return {};
    }

    return {
      PropertyDefinition(node: LegacyAstNode) {
        // Swagger solo serializa propiedades públicas de instancia.
        if (!isPublicInstanceProperty(node)) {
          return;
        }

        const hasApiProperty = (node.decorators ?? []).some((decorator: LegacyAstNode) =>
          options.apiPropertyDecoratorNames.includes(getDecoratorName(decorator)),
        );

        if (!hasApiProperty) {
          context.report({
            data: { name: node.key?.name ?? "anonymous" },
            messageId: "missingApiProperty",
            node: node.key ?? node,
          });
        }
      },
    };
  },
};
