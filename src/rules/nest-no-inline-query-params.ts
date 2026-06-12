import type { TSESTree } from "@typescript-eslint/utils";
import { getDecoratorName } from "#/utils/nest/get-decorator-name";
import { getImportedLocalNames } from "#/utils/imports/get-imported-local-names";
import { getNestInlineQueryOptions } from "#/utils/options/get-nest-inline-query-options";
import { getPropertyName } from "#/utils/ast/get-property-name";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isQueryWithStringArg } from "#/utils/nest/is-query-with-string-arg";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const nestNoInlineQueryParams: RuleModule = {
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
  create(context: RuleContext) {
    const options = getNestInlineQueryOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    let commonNames = new Set();
    let swaggerNames = new Set();

    return {
      Program(node: TSESTree.Program) {
        commonNames = getImportedLocalNames(node, "@nestjs/common");
        swaggerNames = getImportedLocalNames(node, "@nestjs/swagger");
      },
      MethodDefinition(node: TSESTree.MethodDefinition) {
        const isMethodMember = node.kind === "method";
        if (!isMethodMember) {
          return;
        }

        const apiQueryCount = node.decorators.filter(
          (decorator) =>
            getDecoratorName(decorator) === "ApiQuery" &&
            swaggerNames.has("ApiQuery"),
        ).length;

        const inlineQueryCount = node.value.params.filter((param) =>
          param.decorators.some(
            (decorator) =>
              isQueryWithStringArg(decorator) && commonNames.has("Query"),
          ),
        ).length;

        const total = apiQueryCount + inlineQueryCount;

        const staysWithinQueryLimit = total <= options.max;
        if (staysWithinQueryLimit) {
          return;
        }

        context.report({
          data: {
            count: String(total),
            max: String(options.max),
            methodName: getPropertyName(node.key),
          },
          messageId: "tooManyInlineQueryParams",
          node: node.key,
        });
      },
    };
  },
};
