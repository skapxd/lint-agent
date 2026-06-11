// @ts-nocheck
import { getDecoratorName } from "#/utils/get-decorator-name";
import { getImportedLocalNames } from "#/utils/get-imported-local-names";
import { getNestInlineQueryOptions } from "#/utils/get-nest-inline-query-options";
import { isQueryWithStringArg } from "#/utils/is-query-with-string-arg";
import { matchesAnyGlob } from "#/utils/matches-any-glob";

export const nestNoInlineQueryParams = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe multiples @Query('x')/@ApiQuery individuales en un metodo: dos o mas query params son un DTO.",
    },
    messages: {
      tooManyInlineQueryParams:
        "[REFACTOR REQUERIDO] El metodo `{{methodName}}` tiene {{count}} @Query/@ApiQuery individuales (max {{max}}). Dos o mas query params son un DTO disfrazado: (1) crea `dto/list-{recurso}.dto.ts` con cada param como propiedad `?` + @IsOptional + su validador + @ApiPropertyOptional; (2) reemplaza TODOS los `@Query('x') x` por un solo `@Query() filters: ListXxxDto`; (3) elimina los @ApiQuery — el plugin de swagger los genera desde el DTO; (4) usa @Transform/@Type para convertir strings ('true', '25') al tipo real. El ValidationPipe corta el input invalido solo y el DTO queda tipado, testeable y reutilizable.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          max: {
            minimum: 1,
            type: "integer",
          },
        },
        type: "object",
      },
    ],
  },
  create(context) {
    const options = getNestInlineQueryOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    let commonNames = new Set();
    let swaggerNames = new Set();

    return {
      Program(node) {
        commonNames = getImportedLocalNames(node, "@nestjs/common");
        swaggerNames = getImportedLocalNames(node, "@nestjs/swagger");
      },
      MethodDefinition(node) {
        if (node.kind !== "method") {
          return;
        }

        const apiQueryCount = (node.decorators ?? []).filter(
          (decorator) =>
            getDecoratorName(decorator) === "ApiQuery" &&
            swaggerNames.has("ApiQuery"),
        ).length;

        const inlineQueryCount = (node.value.params ?? []).filter((param) =>
          (param.decorators ?? []).some(
            (decorator) =>
              isQueryWithStringArg(decorator) && commonNames.has("Query"),
          ),
        ).length;

        const total = apiQueryCount + inlineQueryCount;

        if (total <= options.max) {
          return;
        }

        context.report({
          data: {
            count: String(total),
            max: String(options.max),
            methodName: node.key?.name ?? "anonymous",
          },
          messageId: "tooManyInlineQueryParams",
          node: node.key ?? node,
        });
      },
    };
  },
};
